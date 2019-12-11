class HostAggregateController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::MoreShowActions
  include Mixins::EmsCommon
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[instances hosts]
  end

  def host_aggregate_form_fields
    assert_privileges("host_aggregate_edit")
    host_aggregate = find_record_with_rbac(HostAggregate, params[:id])
    render :json => {:name   => host_aggregate.name,
                     :ems_id => host_aggregate.ems_id}
  end

  def new
    assert_privileges("host_aggregate_new")
    @host_aggregate = HostAggregate.new
    @in_a_form = true
    @ems_choices = {}
    Rbac::Filterer.filtered(ManageIQ::Providers::CloudManager).select { |ems| ems.supports?(:create_host_aggregate) }.each do |ems|
      @ems_choices[ems.name] = ems.id
    end

    drop_breadcrumb(
      :name => _("Create New Host Aggregate"),
      :url  => "/host_aggregate/new"
    )
  end

  def create
    assert_privileges("host_aggregate_new")
    case params[:button]
    when "cancel"
      javascript_redirect(:action    => 'show_list',
                          :flash_msg => _("Creation of new Host Aggregate was cancelled by the user"))

    when "add"
      @host_aggregate = HostAggregate.new
      options = form_params(params)
      ext_management_system = find_record_with_rbac(ManageIQ::Providers::CloudManager, options[:ems_id])
      if ext_management_system.supports?(:create_host_aggregate)
        task_id = ext_management_system.create_host_aggregate_queue(session[:userid], options)

        add_flash(_("Host Aggregate creation failed: Task start failed"), :error) unless task_id.kind_of?(Integer)

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Host Aggregates not supported by chosen provider"), :error)
        @breadcrumbs&.pop
        javascript_flash
      end
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    host_aggregate_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Host Aggregate \"%{name}\" created") % {:name => host_aggregate_name})
    else
      add_flash(_("Unable to create Host Aggregate \"%{name}\": %{details}") % {
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show_list")
  end

  def edit
    assert_privileges("host_aggregate_edit")
    @host_aggregate = find_record_with_rbac(HostAggregate, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit Host Aggregate \"%{name}\"") % {:name => @host_aggregate.name},
      :url  => "/host_aggregate/edit/#{@host_aggregate.id}"
    )
  end

  def update
    assert_privileges("host_aggregate_edit")
    @host_aggregate = find_record_with_rbac(HostAggregate, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Edit of Host Aggregate \"%{name}\" was cancelled by the user") % {
        :name => @host_aggregate.name
      })

    when "save"
      options = form_params(params)

      if @host_aggregate.supports?(:update_aggregate)
        task_id = @host_aggregate.update_aggregate_queue(session[:userid], options)

        unless task_id.kind_of?(Integer)
          add_flash(_("Edit of Host Aggregate \"%{name}\" failed: Task start failed") % {
            :name => @host_aggregate.name,
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "update_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Update aggregate not supported by Host Aggregate \"%{name}\"") % {
          :name => @host_aggregate.name
        }, :error)
        @breadcrumbs&.pop
        javascript_flash
      end
    end
  end

  def update_finished
    task_id = session[:async][:params][:task_id]
    host_aggregate_id = session[:async][:params][:id]
    host_aggregate_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Host Aggregate \"%{name}\" updated") % {:name => host_aggregate_name})
    else
      add_flash(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect(:action => "show", :id => host_aggregate_id)
  end

  def delete_host_aggregates
    assert_privileges("host_aggregate_delete")

    host_aggregates = checked_or_params

    if host_aggregates.empty?
      add_flash(_("No Host Aggregates were selected for deletion."), :error)
    end

    host_aggregates_to_delete = []
    host_aggregates.each do |host_aggregate_id|
      host_aggregate = HostAggregate.find(host_aggregate_id)
      if host_aggregate.nil?
        add_flash(_("Host Aggregate no longer exists."), :error)
      elsif !host_aggregate.supports?(:delete_aggregate)
        add_flash(_("Delete aggregate not supported by Host Aggregate \"%{name}\"") % {:name => host_aggregate.name}, :error)
      else
        host_aggregates_to_delete.push(host_aggregate)
      end
    end
    process_host_aggregates(host_aggregates_to_delete, "destroy") unless host_aggregates_to_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list"
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "host_aggregate"
      @single_delete = true unless flash_errors?
    end
    flash_to_session
    redirect_to(:action => 'show_list')
  end

  def add_host_select
    assert_privileges("host_aggregate_add_host")
    @host_aggregate = find_record_with_rbac(HostAggregate, params[:id])
    @in_a_form = true
    @host_choices = {}
    ems_clusters = @host_aggregate.ext_management_system.provider.try(:infra_ems).try(:ems_clusters)

    if ems_clusters.present?
      ems_clusters.select(&:compute?).each do |ems_cluster|
        (ems_cluster.hosts - @host_aggregate.hosts).each do |host|
          @host_choices["#{host.name}: #{host.hostname}"] = host.id
        end
      end
    end
    if @host_choices.empty?
      add_flash(_("No hosts available to add to Host Aggregate \"%{name}\"") % {
        :name => @host_aggregate.name
      }, :error)
      session[:flash_msgs] = @flash_array
      @in_a_form = false
      if @lastaction == "show_list"
        redirect_to(:action => "show_list")
      else
        redirect_to(:action => "show", :id => params[:id])
      end
    else
      drop_breadcrumb(
        :name => _("Add Host to Host Aggregate \"%{name}\"") % {:name => @host_aggregate.name},
        :url  => "/host_aggregate/add_host/#{@host_aggregate.id}"
      )
    end
  end

  def add_host
    assert_privileges("host_aggregate_add_host")
    @host_aggregate = find_record_with_rbac(HostAggregate, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Add Host to Host Aggregate \"%{name}\" was cancelled by the user") % {
        :name => @host_aggregate.name
      })

    when "addHost"
      options = form_params(params)
      host = find_record_with_rbac(Host, options[:host_id])

      if @host_aggregate.supports?(:add_host)
        task_id = @host_aggregate.add_host_queue(session[:userid], host)

        unless task_id.kind_of?(Integer)
          add_flash(_("Add Host to Host Aggregate \"%{name}\" failed: Task start failed") % {
            :name => @host_aggregate.name,
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "add_host_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Add Host not supported by Host Aggregate \"%{name}\"") % {
          :name => @host_aggregate.name
        }, :error)
        @breadcrumbs&.pop
        javascript_flash
      end
    end
  end

  def add_host_finished
    task_id = session[:async][:params][:task_id]
    host_aggregate_id = session[:async][:params][:id]
    host_aggregate_name = session[:async][:params][:name]
    host_id = session[:async][:params][:host_id]

    task = MiqTask.find(task_id)
    host = Host.find(host_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Host \"%{hostname}\" added to Host Aggregate \"%{name}\"") % {
        :hostname => host.name,
        :name     => host_aggregate_name
      })
    else
      add_flash(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => host_aggregate_id)
  end

  def remove_host_select
    assert_privileges("host_aggregate_remove_host")
    @host_aggregate = find_record_with_rbac(HostAggregate, params[:id])
    @in_a_form = true
    @host_choices = {}
    @host_aggregate.hosts.each do |host|
      @host_choices["#{host.name}: #{host.hostname}"] = host.id
    end

    if @host_choices.empty?
      add_flash(_("No hosts to remove from Host Aggregate \"%{name}\"") % {
        :name => @host_aggregate.name
      }, :error)
      session[:flash_msgs] = @flash_array
      @in_a_form = false
      if @lastaction == "show_list"
        redirect_to(:action => "show_list")
      else
        redirect_to(:action => "show", :id => params[:id])
      end
    else
      drop_breadcrumb(
        :name => _("Remove Host from Host Aggregate \"%{name}\"") % {:name => @host_aggregate.name},
        :url  => "/host_aggregate/remove_host/#{@host_aggregate.id}"
      )
    end
  end

  def remove_host
    assert_privileges("host_aggregate_remove_host")
    @host_aggregate = find_record_with_rbac(HostAggregate, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Remove Host from Host Aggregate \"%{name}\" was cancelled by the user") % {
        :name => @host_aggregate.name
      })

    when "removeHost"
      options = form_params(params)
      host = find_record_with_rbac(Host, options[:host_id])

      if @host_aggregate.supports?(:remove_host)
        task_id = @host_aggregate.remove_host_queue(session[:userid], host)

        unless task_id.kind_of?(Integer)
          add_flash(_("Remove Host to Host Aggregate \"%{name}\" failed: Task start failed") % {
            :name => @host_aggregate.name,
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "remove_host_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Remove Host not supported by Host Aggregate \"%{name}\"") % {
          :name => @host_aggregate.name
        }, :error)
        @breadcrumbs&.pop
        javascript_flash
      end
    end
  end

  def remove_host_finished
    task_id = session[:async][:params][:task_id]
    host_aggregate_id = session[:async][:params][:id]
    host_aggregate_name = session[:async][:params][:name]
    host_id = session[:async][:params][:host_id]

    task = MiqTask.find(task_id)
    host = Host.find(host_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Host \"%{hostname}\" removed from Host Aggregate \"%{name}\"") % {
        :hostname => host.name,
        :name     => host_aggregate_name
      })
    else
      add_flash(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => host_aggregate_id)
  end

  def cancel_action(message)
    session[:edit] = nil
    @breadcrumbs&.pop
    javascript_redirect(:action    => @lastaction,
                        :id        => @host_aggregate.id,
                        :display   => session[:host_aggregate_display],
                        :flash_msg => message)
  end

  private

  def textual_group_list
    [%i[relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def form_params(in_params)
    options = {}
    %i[name availability_zone ems_id host_id metadata].each do |param|
      options[param] = in_params[param] if in_params[param]
    end
    options
  end

  # dispatches tasks to multiple host aggregates
  def process_host_aggregates(host_aggregates, task)
    return if host_aggregates.empty?

    return unless task == "destroy"

    host_aggregates.each do |host_aggregate|
      audit = {
        :event        => "host_aggregate_record_delete_initiateed",
        :message      => "[#{host_aggregate.name}] Record delete initiated",
        :target_id    => host_aggregate.id,
        :target_class => "HostAggregate",
        :userid       => session[:userid]
      }
      AuditEvent.success(audit)
      host_aggregate.delete_aggregate_queue(session[:userid])
    end
    add_flash(n_("Delete initiated for %{number} Host Aggregate.",
                 "Delete initiated for %{number} Host Aggregates.",
                 host_aggregates.length) % {:number => host_aggregates.length})
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Host Aggregates"), :url => controller_url},
      ],
      :record_info => @host_aggregate,
    }.compact
  end

  menu_section :clo
end

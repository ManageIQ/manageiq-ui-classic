class HostAggregateController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericFormMixin
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
    @in_a_form = true
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
    @in_a_form = true
    @host_aggregate = find_record_with_rbac(HostAggregate, params[:id])
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

    flash_to_session
    # refresh the list
    if @lastaction == "show" && @layout == "host_aggregate" # Textual Summary of Host Aggregate
      @single_delete = true unless flash_errors?
      redirect_to(previous_breadcrumb_url)
    else # list of Host Aggregates
      @refresh_partial = "layouts/gtl" if @lastaction == "show_list"
      redirect_to(last_screen_url)
    end
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
      redirect_to(last_screen_url)
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
      flash_and_redirect(_("Add Host to Host Aggregate \"%{name}\" was cancelled by the user") % {
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
    host_aggregate_name = session[:async][:params][:name]
    host_id = session[:async][:params][:host_id]

    task = MiqTask.find(task_id)
    host = Host.find(host_id)
    if MiqTask.status_ok?(task.status)
      flash_and_redirect(_("Host \"%{hostname}\" added to Host Aggregate \"%{name}\"") % {
        :hostname => host.name,
        :name     => host_aggregate_name
      })
    else
      flash_and_redirect(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end
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
      redirect_to(last_screen_url)
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
      flash_and_redirect(_("Remove Host from Host Aggregate \"%{name}\" was cancelled by the user") % {
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
    host_aggregate_name = session[:async][:params][:name]
    host_id = session[:async][:params][:host_id]

    task = MiqTask.find(task_id)
    host = Host.find(host_id)
    if MiqTask.status_ok?(task.status)
      flash_and_redirect(_("Host \"%{hostname}\" removed from Host Aggregate \"%{name}\"") % {
        :hostname => host.name,
        :name     => host_aggregate_name
      })
    else
      flash_and_redirect(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end
  end

  def download_data
    assert_privileges('host_aggregate_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('host_aggregate_show')
    super
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
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_timeline", :tl_chooser
  feature_for_actions "#{controller_name}_perf", :perf_top_chart
end

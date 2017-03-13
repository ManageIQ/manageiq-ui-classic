class HostAggregateController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::CheckedIdMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin

  def show
    return if perfmenu_click?
    @display = params[:display] || "main" unless pagination_or_gtl_request?

    @lastaction = "show"
    @showtype = "config"
    @host_aggregate = @record = identify_record(params[:id])
    return if record_no_longer_exists?(@host_aggregate)

    @gtl_url = "/show"
    drop_breadcrumb({:name => _("Host Aggregates"),
                     :url  => "/host_aggregate/show_list?page=#{@current_page}&refresh=y"}, true)
    case @display
    when "main", "summary_only"
      get_tagdata(@host_aggregate)
      drop_breadcrumb(:name => _("%{name} (Summary)") % {:name => @host_aggregate.name},
                      :url  => "/availability_zone/show/#{@host_aggregate.id}")
      @showtype = "main"
      set_summary_pdf_data if @display == 'summary_only'

    when "performance"
      show_performance

    when "ems_cloud"
      drop_breadcrumb(:name => _("%{name} (%{table}(s))") % {:name  => @host_aggregate.name,
                                                             :table => ui_lookup(:table => "ems_cloud")},
                      :url  => "/host_aggregate/show/#{@host_aggregate.id}?display=ems_cloud")
      # Get the records (into a view) and the paginator
      @view, @pages = get_view(ManageIQ::Providers::CloudManager, :parent => @host_aggregate)
      @showtype = "ems_cloud"

    when "instances"
      title = ui_lookup(:tables => "vm_cloud")
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @host_aggregate.name, :title => title},
                      :url  => "/host_aggregate/show/#{@host_aggregate.id}?display=#{@display}")
      # Get the records (into a view) and the paginator
      @view, @pages = get_view(ManageIQ::Providers::CloudManager::Vm, :parent => @host_aggregate)
      @showtype = @display

    when "hosts"
      title = ui_lookup(:tables => "host")
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @host_aggregate.name, :title => title},
                      :url  => "/host_aggregate/show/#{@host_aggregate.id}?display=#{@display}")
      @view, @pages = get_view(Host, :parent => @host_aggregate) # Get the records (into a view) and the paginator
      @showtype = @display

    when "timeline"
      @record = find_by_id_filtered(HostAggregate, session[:tl_record_id])
      show_timeline
    end

    replace_gtl_main_div if pagination_request?
  end

  def host_aggregate_form_fields
    assert_privileges("host_aggregate_edit")
    host_aggregate = find_by_id_filtered(HostAggregate, params[:id])
    render :json => {
      :name    => host_aggregate.name,
      :ems_id  => host_aggregate.ems_id
    }
  end

  # handle buttons pressed on the button bar
  def button
    restore_edit_for_search
    copy_sub_item_display_value_to_params
    save_current_page_for_refresh

    handle_tag_presses(params[:pressed]) do
      return if @flash_array.nil?
    end

    handle_button_pressed(params[:pressed])

    return if performed?

    handle_sub_item_presses(params[:pressed]) do |pfx|
      process_vm_buttons(pfx)

      return if button_control_transferred?(params[:pressed])

      unless button_has_redirect_suffix?(params[:pressed])
        set_refresh_and_show
      end
    end

    check_if_button_is_implemented

    if button_has_redirect_suffix?(params[:pressed])
      render_or_redirect_partial_for(params[:pressed])
    elsif button_replace_gtl_main?
      replace_gtl_main_div
    else
      host_aggregate_javascript_redirect
    end
  end

  def new
    assert_privileges("host_aggregate_new")
    @host_aggregate = HostAggregate.new
    @in_a_form = true
    @ems_choices = {}
    ManageIQ::Providers::CloudManager.select { |ems| ems.supports?(:create_host_aggregate) }.each do |ems|
      @ems_choices[ems.name] = ems.id
    end

    drop_breadcrumb(
      :name => _("Create New %{model}") % {:model => ui_lookup(:table => 'host_aggregate')},
      :url  => "/host_aggregate/new"
    )
  end

  def create
    assert_privileges("host_aggregate_new")
    case params[:button]
    when "cancel"
      javascript_redirect :action    => 'show_list',
                          :flash_msg => _("Creation of new %{model} was cancelled by the user") % {
                            :model => ui_lookup(:table => 'host_aggregate')
                          }

    when "add"
      @host_aggregate = HostAggregate.new
      options = form_params(params)
      ext_management_system = find_by_id_filtered(ManageIQ::Providers::CloudManager,
                                                  options[:ems_id])
      if ext_management_system.supports?(:create_host_aggregate)
        task_id = ext_management_system.create_host_aggregate_queue(session[:userid], options)

        add_flash(_("Host Aggregate creation failed: Task start failed: ID [%{id}]") %
                  {:id => task_id.to_s}, :error) unless task_id.kind_of?(Integer)

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Host Aggregates not supported by chosen provider"), :error)
        @breadcrumbs.pop if @breadcrumbs
        javascript_flash
      end
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    host_aggregate_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("%{model} \"%{name}\" created") % {
        :model => ui_lookup(:table => 'host_aggregate'),
        :name  => host_aggregate_name
      })
    else
      add_flash(_("Unable to create %{model} \"%{name}\": %{details}") % {
        :model   => ui_lookup(:table => 'host_aggregate'),
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show_list"
  end

  def edit
    assert_privileges("host_aggregate_edit")
    @host_aggregate = find_by_id_filtered(HostAggregate, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit %{model} \"%{name}\"") % {:model => ui_lookup(:table => 'host_aggregate'),
                                                 :name  => @host_aggregate.name},
      :url  => "/host_aggregate/edit/#{@host_aggregate.id}"
    )
  end

  def update
    assert_privileges("host_aggregate_edit")
    @host_aggregate = find_by_id_filtered(HostAggregate, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Edit of %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'host_aggregate'),
        :name  => @host_aggregate.name
      })

    when "save"
      options = form_params(params)

      if @host_aggregate.supports?(:update_aggregate)
        task_id = @host_aggregate.update_aggregate_queue(session[:userid], options)

        unless task_id.kind_of?(Integer)
          add_flash(_("Edit of %{model} \"%{name}\" failed: Task start failed: ID [%{id}]") % {
            :model => ui_lookup(:table => 'host_aggregate'),
            :name  => @host_aggregate.name,
            :id    => task_id.to_s
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "update_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Update aggregate not supported by %{model} \"%{name}\"") % {
          :model => ui_lookup(:table => 'host_aggregate'),
          :name  => @host_aggregate.name
        }, :error)
        @breadcrumbs.pop if @breadcrumbs
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
      add_flash(_("%{model} \"%{name}\" updated") % {
        :model => ui_lookup(:table => 'host_aggregate'),
        :name  => host_aggregate_name
      })
    else
      add_flash(_("Unable to update %{model} \"%{name}\": %{details}") % {
        :model   => ui_lookup(:table => 'host_aggregate'),
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show", :id => host_aggregate_id
  end

  def delete_host_aggregates
    assert_privileges("host_aggregate_delete")

    host_aggregates = if @lastaction == "show_list" || (@lastaction == "show" && @layout != "host_aggregate")
                        find_checked_items
                      else
                        [params[:id]]
                      end

    if host_aggregates.empty?
      add_flash(_("No %{models} were selected for deletion.") % {
        :models => ui_lookup(:tables => "host_aggregate")
      }, :error)
    end

    host_aggregates_to_delete = []
    host_aggregates.each do |host_aggregate_id|
      host_aggregate = HostAggregate.find(host_aggregate_id)
      if host_aggregate.nil?
        add_flash(_("%{model} no longer exists.") % {:model => ui_lookup(:table => "host_aggregate")}, :error)
      elsif !host_aggregate.supports?(:delete_aggregate)
        add_flash(_("Delete aggregate not supported by %{model} \"%{name}\"") % {
          :model => ui_lookup(:table => 'host_aggregate'),
          :name  => host_aggregate.name
        }, :error)
      else
        host_aggregates_to_delete.push(host_aggregate)
      end
    end
    process_host_aggregates(host_aggregates_to_delete, "destroy") unless host_aggregates_to_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "host_aggregate"
      @single_delete = true unless flash_errors?
      if @flash_array.nil?
        add_flash(_("The selected %{model} was deleted") % {:model => ui_lookup(:table => "host_aggregate")})
      end
    end
  end

  def add_host_select
    assert_privileges("host_aggregate_add_host")
    @host_aggregate = find_by_id_filtered(HostAggregate, params[:id])
    @in_a_form = true
    @host_choices = {}
    ems_clusters = @host_aggregate.ext_management_system.provider.try(:infra_ems).try(:ems_clusters)

    unless ems_clusters.blank?
      ems_clusters.select(&:compute?).each do |ems_cluster|
        (ems_cluster.hosts - @host_aggregate.hosts).each do |host|
          @host_choices["#{host.name}: #{host.hostname}"] = host.id
        end
      end
    end
    if @host_choices.empty?
      add_flash(_("No hosts available to add to %{model} \"%{name}\"") % {
        :model => ui_lookup(:table => 'host_aggregate'),
        :name  => @host_aggregate.name
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
        :name => _("Add Host to %{model} \"%{name}\"") % {:model => ui_lookup(:table => 'host_aggregate'),
                                                          :name  => @host_aggregate.name},
        :url  => "/host_aggregate/add_host/#{@host_aggregate.id}"
      )
    end
  end

  def add_host
    assert_privileges("host_aggregate_add_host")
    @host_aggregate = find_by_id_filtered(HostAggregate, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Add Host to %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'host_aggregate'),
        :name  => @host_aggregate.name
      })

    when "addHost"
      options = form_params(params)
      host = find_by_id_filtered(Host, options[:host_id])

      if @host_aggregate.supports?(:add_host)
        task_id = @host_aggregate.add_host_queue(session[:userid], host)

        unless task_id.kind_of?(Integer)
          add_flash(_("Add Host to %{model} \"%{name}\" failed: Task start failed: ID [%{id}]") % {
            :model => ui_lookup(:table => 'host_aggregate'),
            :name  => @host_aggregate.name,
            :id    => task_id.to_s
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "add_host_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Add Host not supported by %{model} \"%{name}\"") % {
          :model => ui_lookup(:table => 'host_aggregate'),
          :name  => @host_aggregate.name
        }, :error)
        @breadcrumbs.pop if @breadcrumbs
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
      add_flash(_("Host \"%{hostname}\" added to %{model} \"%{name}\"") % {
        :hostname => host.name,
        :model    => ui_lookup(:table => 'host_aggregate'),
        :name     => host_aggregate_name
      })
    else
      add_flash(_("Unable to update %{model} \"%{name}\": %{details}") % {
        :model   => ui_lookup(:table => 'host_aggregate'),
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show", :id => host_aggregate_id
  end

  def remove_host_select
    assert_privileges("host_aggregate_remove_host")
    @host_aggregate = find_by_id_filtered(HostAggregate, params[:id])
    @in_a_form = true
    @host_choices = {}
    @host_aggregate.hosts.each do |host|
      @host_choices["#{host.name}: #{host.hostname}"] = host.id
    end

    if @host_choices.empty?
      add_flash(_("No hosts to remove from %{model} \"%{name}\"") % {
        :model => ui_lookup(:table => 'host_aggregate'),
        :name  => @host_aggregate.name
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
        :name => _("Remove Host from %{model} \"%{name}\"") % {:model => ui_lookup(:table => 'host_aggregate'),
                                                               :name  => @host_aggregate.name},
        :url  => "/host_aggregate/remove_host/#{@host_aggregate.id}"
      )
    end
  end

  def remove_host
    assert_privileges("host_aggregate_remove_host")
    @host_aggregate = find_by_id_filtered(HostAggregate, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Remove Host from %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'host_aggregate'),
        :name  => @host_aggregate.name
      })

    when "removeHost"
      options = form_params(params)
      host = find_by_id_filtered(Host, options[:host_id])

      if @host_aggregate.supports?(:remove_host)
        task_id = @host_aggregate.remove_host_queue(session[:userid], host)

        unless task_id.kind_of?(Integer)
          add_flash(_("Remove Host to %{model} \"%{name}\" failed: Task start failed: ID [%{id}]") % {
            :model => ui_lookup(:table => 'host_aggregate'),
            :name  => @host_aggregate.name,
            :id    => task_id.to_s
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "remove_host_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Remove Host not supported by %{model} \"%{name}\"") % {
          :model => ui_lookup(:table => 'host_aggregate'),
          :name  => @host_aggregate.name
        }, :error)
        @breadcrumbs.pop if @breadcrumbs
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
      add_flash(_("Host \"%{hostname}\" removed from %{model} \"%{name}\"") % {
        :hostname => host.name,
        :model    => ui_lookup(:table => 'host_aggregate'),
        :name     => host_aggregate_name
      })
    else
      add_flash(_("Unable to update %{model} \"%{name}\": %{details}") % {
        :model   => ui_lookup(:table => 'host_aggregate'),
        :name    => host_aggregate_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show", :id => host_aggregate_id
  end

  def cancel_action(message)
    session[:edit] = nil
    @breadcrumbs.pop if @breadcrumbs
    javascript_redirect :action    => @lastaction,
                        :id        => @host_aggregate.id,
                        :display   => session[:host_aggregate_display],
                        :flash_msg => message
  end

  private

  def textual_group_list
    [%i(relationships), %i(tags)]
  end
  helper_method :textual_group_list

  def form_params(in_params)
    options = {}
    [:name, :availability_zone, :ems_id, :host_id, :metadata].each do |param|
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

  def button_sub_item_prefixes
    %w(image_ instance_)
  end

  def handled_buttons
    %(
      host_aggregate_new
      host_aggregate_edit
      host_aggregate_delete
      host_aggregate_add_host
      host_aggregate_remove_host
    )
  end

  def handle_host_aggregate_new
    js_redirect_to_new
  end

  def handle_host_aggregate_edit
    js_redirect_to_edit_for_checked_id
  end

  def handle_host_aggregate_delete
    delete_host_aggregates
    render_flash
  end

  def handle_host_aggregate_add_host
    javascript_redirect :action => "add_host_select", :id => checked_item_id
  end

  def handle_host_aggregate_remove_host
    javascript_redirect :action => "remove_host_select", :id => checked_item_id
  end

  def host_aggregate_javascript_redirect
    render_update_with_prologue do |page|
      unless @refresh_partial.nil?
        if refreshing_flash_msg?
          replace_refresh_div_with_partial(page)
        elsif %w(images instances).include?(@display) # If displaying vms, action_url s/b show
          button_center_toolbar(page)
          page.replace_html("main_div",
                            :partial => "layouts/gtl",
                            :locals  => {:action_url => "show/#{@host_aggregate.id}"})
        else
          replace_refresh_div_contents_with_partial(page)
        end
      end
    end
  end

  menu_section :clo
end

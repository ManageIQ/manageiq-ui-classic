class PhysicalServerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  def self.display_methods
    %w[network_devices storage_devices physical_switches]
  end

  def display_network_devices
    nested_list(GuestDevice, :named_scope => :with_ethernet_type, :breadcrumb_title => _("Network Devices"))
  end

  def display_storage_devices
    nested_list(GuestDevice, :named_scope => :with_storage_type, :breadcrumb_title => _("Storage Devices"))
  end

  def self.table_name
    @table_name ||= "physical_servers"
  end

  def session_data
    @title  = _("Physical Servers")
    @layout = "physical_server"
    @lastaction = session[:physical_server_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_server_lastaction] = @lastaction
  end

  def show_list
    # Disable the cache to prevent a caching problem that occurs when
    # pressing the browser's back arrow button to return to the show_list
    # page while on the Physical Server's show page. Disabling the cache
    # causes the page and its session variables to actually be reloaded.
    disable_client_cache

    process_show_list
  end

  def textual_group_list
    [
      %i[properties management_networks relationships],
      %i[power_management firmware_compliance firmware_details asset_details smart_management],
    ]
  end
  helper_method(:textual_group_list)

  def button
    assign_policies(PhysicalServer) if params[:pressed] == "physical_server_protect"
    tag(PhysicalServer) if params[:pressed] == "physical_server_tag"

    return if %w[physical_server_protect physical_server_tag].include?(params[:pressed]) &&
              @flash_array.nil? # Some other screen is showing, so return
    if params[:pressed] == "physical_server_timeline"
      @record = find_record_with_rbac(PhysicalServer, params[:id])
      show_timeline
      javascript_redirect(:action => 'show', :id => @record.id, :display => 'timeline')
    end
  end

  def console
    params[:task_id] ? console_after_task : console_before_task
  end

  def console_file
    miq_task = MiqTask.find(params[:task_id])
    jnlp_file_content = miq_task.task_results.resource
    send_data(jnlp_file_content, :filename => "remoteConsole.jnlp")
  end

  def provision
    provisioning_ids = find_records_with_rbac(PhysicalServer, checked_or_params).ids

    javascript_redirect(:controller     => "miq_request",
                        :action         => "prov_edit",
                        :prov_id        => provisioning_ids,
                        :org_controller => "physical_server",
                        :escape         => false)
  end

  # Task complete, show error or send remote console resource
  def console_after_task
    miq_task = MiqTask.find(params[:task_id])
    unless miq_task.results_ready?
      add_flash(_("Console access failed: %{message}") % {:message => miq_task.message}, :error)
      javascript_flash(:spinner_off => true)
      return
    end

    resource_type = miq_task.task_results.type

    if resource_type == :url
      url = miq_task.task_results.resource
      javascript_open_window(url)
    elsif resource_type == :java_jnlp_file
      render :update do |page|
        page << javascript_prologue
        page << set_spinner_off
        page.redirect_to(:controller     => "physical_server",
                         :action         => "console_file",
                         :task_id        => params[:task_id],
                         :org_controller => "physical_server",
                         :escape         => false)
      end
    else
      add_flash(_("Console access failed: Unexpected remote console resource type [%{type}]") %
                  {:type => resource_type}, :error)
      javascript_flash(:spinner_off => true)
    end
  end

  def console_before_task
    record = find_record_with_rbac(PhysicalServer, params[:id])
    task_id = record.remote_console_acquire_resource_queue(session[:userid])
    unless task_id.kind_of?(Integer)
      add_flash(_("Console access failed: Task start failed"), :error)
    end

    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      initiate_wait_for_task(:task_id => task_id)
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Servers")},
        {:url   => controller_url, :title => _("Physical Servers")},
      ],
    }
  end
end

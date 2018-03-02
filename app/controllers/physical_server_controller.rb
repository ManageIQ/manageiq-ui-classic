class PhysicalServerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.display_methods
    %w(guest_devices)
  end

  def display_guest_devices
    nested_list(GuestDevice, :named_scope => :with_ethernet_type)
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
      %i(properties networks relationships power_management assets firmware_details smart_management),
    ]
  end
  helper_method(:textual_group_list)

  def button
    assign_policies(PhysicalServer) if params[:pressed] == "physical_server_protect"
    tag(PhysicalServer) if params[:pressed] == "physical_server_tag"

    return if %w(physical_server_protect physical_server_tag).include?(params[:pressed]) &&
              @flash_array.nil? # Some other screen is showing, so return
    if params[:pressed] == "physical_server_timeline"
      @record = find_record_with_rbac(ManageIQ::Providers::PhysicalInfraManager::PhysicalServer, params[:id])
      show_timeline
      javascript_redirect(:action => 'show', :id => @record.id, :display => 'timeline')
    end
  end

  def provision
    provisioning_ids = find_checked_ids_with_rbac(PhysicalServer)
    provisioning_ids.push(find_id_with_rbac(PhysicalServer, params[:id])) if provisioning_ids.empty?

    javascript_redirect(:controller     => "miq_request",
                        :action         => "prov_edit",
                        :prov_id        => provisioning_ids,
                        :org_controller => "physical_server",
                        :escape         => false)
  end
end

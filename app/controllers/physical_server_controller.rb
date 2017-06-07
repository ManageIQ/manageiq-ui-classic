class PhysicalServerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

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
      %i(properties networks relationships power_management assets firmware_details),
    ]
  end
  helper_method :textual_group_list

  # Handles buttons pressed on the toolbar
  def button
    if params[:pressed] == "physical_server_power_on"
      physical_server_power_on
    elsif params[:pressed] == "physical_server_power_off"
      physical_server_power_off
    elsif params[:pressed] == "physical_server_restart"
      physical_server_restart
    elsif params[:pressed] == "physical_server_blink_loc_led"
      physical_server_blink_loc_led
    elsif params[:pressed] == "physical_server_turn_on_loc_led"
      physical_server_turn_on_loc_led
    elsif params[:pressed] == "physical_server_turn_off_loc_led"
      physical_server_turn_off_loc_led
    end
  end

  private

  def physical_server_power_on
    assert_privileges('physical_server_power_on')
    servers = find_records_with_rbac(PhysicalServer, checked_or_params)
    servers.each do |server|
      # Trigger power on action on the server
    end
  end

  def physical_server_power_off
    assert_privileges('physical_server_power_off')
    servers = find_records_with_rbac(PhysicalServer, checked_or_params)
    servers.each do |server|
      # Trigger power on action on the server
    end
  end

  def physical_server_restart
    assert_privileges('physical_server_restart')
    servers = find_records_with_rbac(PhysicalServer, checked_or_params)
    servers.each do |server|
      # Trigger power on action on the server
    end
  end

  def physical_server_blink_loc_led
    assert_privileges('physical_server_blink_loc_led')
    servers = find_records_with_rbac(PhysicalServer, checked_or_params)
    servers.each do |server|
      # Trigger power on action on the server
    end
  end

  def physical_server_turn_on_loc_led
    assert_privileges('physical_server_turn_on_loc_led')
    servers = find_records_with_rbac(PhysicalServer, checked_or_params)
    servers.each do |server|
      # Trigger power on action on the server
    end
  end

  def physical_server_turn_off_loc_led
    assert_privileges('physical_server_turn_off_loc_led')
    servers = find_records_with_rbac(PhysicalServer, checked_or_params)
    servers.each do |server|
      # Trigger power on action on the servergit sta
    end
  end
end

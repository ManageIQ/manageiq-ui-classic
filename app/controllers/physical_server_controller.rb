class PhysicalServerController  < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "physical_servers"
  end

  def get_session_data
    @title  = _("Physical Servers")
    @layout = "physical_server"
    @lastaction = session[:physical_server_lastaction]
  end

  def collect_data(server_id)
    PhysicalServerService.new(server_id, self).all_data
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_server_lastaction] = @lastaction
  end


  def show_list
    process_show_list
  end

  # Handles buttons pressed on the toolbar
  def button
    button_pressed = params[:pressed]
    server_id = params[:id]
    server_ids = []
    servers = []

    # Either a list of servers or coming from a different controller
    if @lastaction == "show_list" || @layout != "physical_server"
      server_ids = find_checked_items
      server_ids.each do |server_id|
        servers.push(PhysicalServer.find_by_id(server_id))
      end
      if server_ids.empty?
        _log.error("No servers to perform the #{button_pressed} action on")
      end
    # A single server
    else 
      if server_id.nil? || PhysicalServer.find_by_id(server_id).nil?
        _log.error("No server to perform the #{button_pressed} action on")
      else
        servers.push(PhysicalServer.find_by_id(server_id))
      end
    end

    # Apply the selected action to the servers
    servers.each do |server|
      case button_pressed
        when "physical_server_power_on" then server.power_on
        when "physical_server_power_off" then server.power_off
        when "physical_server_restart" then server.restart
        when "physical_server_blink_loc_led" then server.blink_loc_led
        when "physical_server_turn_on_loc_led" then server.turn_on_loc_led
        when "physical_server_turn_off_loc_led" then server.turn_off_loc_led
        else _log.error("Unknown action: #{button_pressed}")
      end
    end
  end
end

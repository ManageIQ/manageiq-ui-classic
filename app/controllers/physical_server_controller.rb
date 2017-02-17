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
        display_error_message("No server IDs found for the selected servers")
      end
    # A single server
    else 
      if server_id.nil? || PhysicalServer.find_by_id(server_id).nil?
        display_error_message("No server ID found for the current server")
      else
        servers.push(PhysicalServer.find_by_id(server_id))
      end
    end

    # Apply the selected action to the servers
    action_str = ""
    servers.each do |server|
      case button_pressed
        when "physical_server_power_on"
          server.power_on
          action_str = "Power On"
        when "physical_server_power_off"
          server.power_off
          action_str = "Power Off"
        when "physical_server_restart" 
          server.restart
          action_str = "Restart"
        when "physical_server_blink_loc_led" 
          server.blink_loc_led
          action_str = "Blink LED"
        when "physical_server_turn_on_loc_led"
          server.turn_on_loc_led
          action_str = "Turn On LED"
        when "physical_server_turn_off_loc_led" 
          server.turn_off_loc_led
          action_str = "Turn Off LED"
        else
          display_error_message("Unknown action: #{button_pressed}")
      end
    end

    # If the action string is not empty, the action was successfully initiated
    if action_str != ""
      msg = "Successfully initiated the #{action_str} action"
      display_success_message(msg)
    end
  end

  private

  # Display an error message
  def display_error_message(msg)
    display_message(msg, :error)
  end

  # Display a success message
  def display_success_message(msg)
    display_message(msg, :success)
  end

  # Display a message
  def display_message(msg, level)
    add_flash(_(msg), level)
    render_flash
  end
end

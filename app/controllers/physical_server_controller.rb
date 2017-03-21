class PhysicalServerController < ApplicationController
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
    # Disable the cache to prevent a caching problem that occurs when
    # pressing the browser's back arrow button to return to the show_list
    # page while on the Physical Server's show page. Disabling the cache
    # causes the page and its session variables to actually be reloaded.
    disable_client_cache

    process_show_list
  end

  # Handles buttons pressed on the toolbar
  def button
    # Get the list of servers to apply the action to
    servers = retrieve_servers

    # Apply the action (depending on the button pressed) to the servers
    apply_action_to_servers(servers)
  end

  private

  # Maps button actions to actual method names to be called and the
  # corresponding result status messages to be displayed
  ACTIONS = {"physical_server_power_on"         => [:power_on,         "Power On"],
             "physical_server_power_off"        => [:power_off,        "Power Off"],
             "physical_server_restart"          => [:restart,          "Restart"],
             "physical_server_blink_loc_led"    => [:blink_loc_led,    "Blink LED"],
             "physical_server_turn_on_loc_led"  => [:turn_on_loc_led,  "Turn On LED"],
             "physical_server_turn_off_loc_led" => [:turn_off_loc_led, "Turn Off LED"]}.freeze

  # Displays an error message
  def display_error_message(msg)
    display_message(msg, :error)
  end

  # Displays a success message
  def display_success_message(msg)
    display_message(msg, :success)
  end

  # Displays a message
  def display_message(msg, level)
    add_flash(_(msg), level)
    render_flash
  end

  # Returns a list of servers to which the button action will be applied
  def retrieve_servers
    server_id = params[:id]
    servers = []

    # A list of servers
    if @lastaction == "show_list"
      server_ids = find_checked_items
      server_ids.each do |id|
        servers.push(PhysicalServer.find_by('id' => id))
      end
      if server_ids.empty?
        display_error_message("No server IDs found for the selected servers")
      end
    # A single server
    elsif server_id.nil? || PhysicalServer.find_by('id' => server_id).nil?
      display_error_message("No server ID found for the current server")
    else
      servers.push(PhysicalServer.find_by('id' => server_id))
    end

    servers
  end

  # Applies the appropriate action to a list of servers depending
  # on the button pressed
  def apply_action_to_servers(servers)
    button_pressed = params[:pressed]

    # Apply the appropriate action to each server
    if ACTIONS.key?(button_pressed)
      method = ACTIONS[button_pressed][0]
      action_str = ACTIONS[button_pressed][1]
      servers.each do |server|
        server.send(method)
      end
      msg = "Successfully initiated the #{action_str} action"
      display_success_message(msg)
    else
      display_error_message("Unknown action: #{button_pressed}")
    end
  end
end

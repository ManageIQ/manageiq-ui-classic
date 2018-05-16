class PhysicalSwitchController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "switches"
  end

  def session_data
    @title      = _("Physical Switches")
    @layout     = "physical_switch"
    @lastaction = session[:physical_switch_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_switch_lastaction] = @lastaction
  end

  def show_list
    process_show_list
  end

  def textual_group_list
    [
      %i(properties management_networks relationships power_management),
      %i(firmware_details ports),
    ]
  end
  helper_method(:textual_group_list)

  def self.display_methods
    %w(physical_switches)
  end
end

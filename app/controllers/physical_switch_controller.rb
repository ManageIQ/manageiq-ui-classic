class PhysicalSwitchController < ApplicationController
  include Mixins::GenericListMixin
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
    # Disable the cache to prevent a caching problem that occurs when
    # pressing the browser's back arrow button to return to the show_list
    # page while on the Switches' show page. Disabling the cache
    # causes the page and its session variables to actually be reloaded.
    disable_client_cache

    process_show_list
  end

  def textual_group_list
    [
      %i(properties relationships),
    ]
  end
  helper_method(:textual_group_list)
end

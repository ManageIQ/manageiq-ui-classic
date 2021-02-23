class AutomationManagerConfiguredSystemController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  def self.table_name
    @table_name ||= "automation_manager_configured_system"
  end

  def button
    case params[:pressed]
    when "automation_manager_configured_system_tag"
      tag(self.class.model)
    end
  end

  def download_data
    assert_privileges('automation_manager_configured_system_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('automation_manager_configured_system_show')
    super
  end

  private

  def textual_group_list
    [%i[properties tags]]
  end
  helper_method :textual_group_list

  def get_session_data
    @title        = _("Configured Systems")
    @layout       = "automation_manager_configured_system"
    @lastaction   = session[:automation_manager_configured_system_lastaction]
    @display      = session[:automation_manager_configured_system_display]
    @current_page = session[:automation_manager_configured_system_current_page]
  end

  def set_session_data
    super
    session[:layout]                                            = @layout
    session[:automation_manager_configured_system_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible Tower")},
        {:title => _("Configured Systems"), :url => controller_url},
      ],
    }
  end

  menu_section :at
  feature_for_actions controller_name, *ADV_SEARCH_ACTIONS
  toolbar :automation_manager_configured_system, :automation_manager_configured_systems
end

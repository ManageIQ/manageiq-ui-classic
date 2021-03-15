class EmsAutomationController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::ManagerControllerMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data


  def button
    @edit = session[:edit] # Restore @edit for adv search box

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    model = self.class.model
    tag(model) if params[:pressed] == "ems_automation_tag"
    provision if params[:pressed] == "ems_automation_provision"
    render_flash unless performed?
  end

  def self.display_methods
    %w[configured_systems]
  end

  def self.table_name
    @table_name ||= "ems_automation"
  end

  def download_data
    assert_privileges('ems_automation_view')
    super
  end

  def download_summary_pdf
    assert_privileges('ems_automation_view')
    super
  end

  private

  def automation_manager_pause
    pause_or_resume_emss(:pause => true)
  end

  def automation_manager_resume
    pause_or_resume_emss(:resume => true)
  end

  def textual_group_list
    [%i[properties relationships status tags]]
  end
  helper_method :textual_group_list

  def get_session_data
    @title        = _("Providers")
    @layout       = "ems_automation"
    @lastaction   = session[:ems_automation_lastaction]
    @display      = session[:ems_automation_display]
    @current_page = session[:ems_automation_current_page]
  end

  def set_session_data
    super
    session[:layout]                      = @layout
    session[:ems_automation_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible Tower")},
        {:title => _("Providers"), :url => controller_url},
      ],
    }
  end

  menu_section :at
  feature_for_actions controller_name, *ADV_SEARCH_ACTIONS
  toolbar :ems_automation, :ems_automations
end

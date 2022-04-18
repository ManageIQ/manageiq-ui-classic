class EmsAutomationController < ApplicationController
  include Mixins::GenericFormMixin
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
    case params[:pressed]
    when "ems_automation_tag"
      tag(self.class.model)
    when "ems_automation_refresh_provider"
      refresh
    end

    if @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
    end
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

  def refresh
    assert_privileges("ems_automation_refresh_provider")
    manager_button_operation('refresh_ems', _('Refresh'))
  end

  private

  def concrete_model
    ManageIQ::Providers::ExternalAutomationManager
  end

  def self.model_to_name(_provmodel)
    Dictionary.gettext('ems_automation', :type => :ui_title, :translate => false)
  end

  def privilege_prefix
    "ems_automation"
  end

  def set_redirect_vars
    @in_a_form = true
    @redirect_controller = "ems_automation"
    @redirect_id = @provider_manager.id if @provider_manager.try(:id)
    @refresh_partial = @provider_manager.try(:id) ? "edit" : "new"
  end

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
        {:title => _("Providers"), :url => controller_url},
      ],
      :record_info => @ems,
    }
  end

  menu_section :at
  feature_for_actions controller_name, *ADV_SEARCH_ACTIONS
  toolbar :ems_automation, :ems_automations
end

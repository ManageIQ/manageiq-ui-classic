class ConfigurationJobController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def self.model
    ManageIQ::Providers::AnsibleTower::AutomationManager::Job
  end

  def self.table_name
    @table_name ||= "configuration_job"
  end

  def parameters
    assert_privileges("configuration_job_view")

    show_association('parameters', _('Parameters'), :parameters, OrchestrationStackParameter)
  end

  # handle buttons pressed on the button bar
  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:page] = @current_page if @current_page.nil? # Save current page for list refresh

    params[:page] = @current_page if @current_page.nil? # Save current page for list refresh
    @refresh_div = "main_div" # Default div for button.rjs to refresh

    case params[:pressed]
    when "configuration_job_delete"
      configuration_job_delete
    when "configuration_job_tag"
      tag(ManageIQ::Providers::AnsibleTower::AutomationManager::Job)
    when "configuration_job_reload"
      # TODO: this line is not needed when feature name "configuration_job_reload" will exist
      assert_privileges("configuration_job_control")

      replace_gtl_main_div
      return
    end
    return if %w[configuration_job_tag].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing, so return

    check_if_button_is_implemented

    if single_delete_test
      single_delete_redirect
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash
    end
  end

  def title
    _("Job")
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible Tower")},
        {:title => _("Jobs"), :url => controller_url},
      ],
    }
  end

  menu_section :at
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
end

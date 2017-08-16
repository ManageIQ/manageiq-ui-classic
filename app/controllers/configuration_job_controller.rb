class ConfigurationJobController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  def self.model
    ManageIQ::Providers::AnsibleTower::AutomationManager::Job
  end

  def self.table_name
    @table_name ||= "configuration_job"
  end

  def ems_path(*args)
    ems_configprovider_path(*args)
  end

  def parameters
    show_association('parameters', _('Parameters'), 'parameter', :parameters, OrchestrationStackParameter)
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
    end
    return if %w(configuration_job_tag).include?(params[:pressed]) && @flash_array.nil? # Tag screen showing, so return

    if @flash_array.nil? && !@refresh_partial # if no button handler ran, show not implemented msg
      add_flash(_("Button not yet implemented"), :error)
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    elsif @flash_array && @lastaction == "show"
      @configuration_job = @record = identify_record(params[:id])
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    end

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
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  menu_section :at
end

class ConfigurationScriptController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::ManagerControllerMixin

  menu_section :at
  feature_for_actions "#{controller_name}_providers", *ADV_SEARCH_ACTIONS

  def self.table_name
    @table_name ||= "configuration_script"
  end

  def tagging
    @explorer ||= true
    case x_active_accord
    when :automation_manager_providers
      assert_privileges("automation_manager_provider_tag")
      tagging_edit(class_for_provider_node.to_s, false)
    when :automation_manager_cs_filter
      assert_privileges("automation_manager_configured_system_tag")
      tagging_edit('ConfiguredSystem', false)
    when :configuration_scripts
      assert_privileges("configuration_script_tag")
      tagging_edit('ConfigurationScript', false)
    end
    render_tagging_form
  end

  def validate_before_save?
    true
  end

  def providers_active_tree?
    x_active_tree == :automation_manager_providers_tree
  end

  def download_data
    assert_privileges('automation_manager_providers_view')
    super
  end

  def download_summary_pdf
    assert_privileges('automation_manager_providers_view')
    super
  end

  private

  def automation_manager_pause
    pause_or_resume_emss(:pause => true)
  end

  def automation_manager_resume
    pause_or_resume_emss(:resume => true)
  end

  def template_record?
    @record.kind_of?(ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationWorkflow) || @record.kind_of?(ConfigurationScript)
  end
  helper_method :template_record?

  def textual_group_list
    [%i[properties tags]]
  end
  helper_method :textual_group_list

  def filtering?
    %w[automation_manager_cs_filter_tree configuration_scripts_tree].include?(x_tree[:tree].to_s)
  end

  def group_summary_tab_selected?
    @inventory_group_record && @sb[:active_tab] == 'summary'
  end

  def locals_for_service_dialog
    {:action_url => 'service_dialog',
     :no_reset   => true,
     :record_id  => @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]}
  end

  def update_service_dialog_partials(presenter)
    presenter.update(:main_div, r[:partial => 'configscript_service_dialog',
                                  :locals  => locals_for_service_dialog])
  end

  def active_tab_configured_systems?
    (%w[x_show x_search_by_name].include?(action_name) && managed_group_record?)
  end

  def valid_managed_group_record?(inventory_group_record)
    inventory_group_record.try(:id)
  end

  def valid_configuration_script_record?(configuration_script_record)
    configuration_script_record.try(:id)
  end

  def configuration_script_service_dialog
    assert_privileges("configuration_script_service_dialog")
    cs = ConfigurationScript.find_by(:id => params[:miq_grid_checks] || params[:id])
    @edit = {:rec_id => cs.id}
    @in_a_form = true
    @right_cell_text = _("Adding a new Service Dialog from \"%{name}\"") % {:name => cs.name}
    render_service_dialog_form
  end

  def get_session_data
    @title = _("Templates")
    @layout = "configuration_script"
    @lastaction = session[:configuration_script_lastaction]
    @display = session[:configuration_script_display]
    @current_page = session[:configuration_script_current_page]
  end

  def set_session_data
    super
    session[:layout]                 = @layout
    session[:configuration_script_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible Tower")},
        {:title => _("Templates"), :url => controller_url},
      ],
    }
  end
end

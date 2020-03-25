class ConfigurationManagerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::ManagerControllerMixin
  include Mixins::FindRecord

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::ConfigurationManager
  end

  def self.table_name
    @table_name ||= "configuration_manager"
  end

  def self.display_methods
    %w[configuration_profiles configured_systems]
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[configuration_profiles configured_systems].include?(@display) # Were we displaying nested list

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    model = self.class.model
    tag(model) if params[:pressed] == "#{params[:controller]}_tag"

    if [ConfiguredSystem].include?(model)
      assign_policies(model) if params[:pressed] == "#{model.name.underscore}_protect"
      check_compliance(model) if params[:pressed] == "#{model.name.underscore}_check_compliance"
    end

    case params[:pressed]
    when 'configuration_manager_edit_provider'
      edit
    when 'configuration_manager_add_provider'
      new
    when "configuration_manager_refresh_provider"
      refresh
    when "configuration_manager_delete_provider"
      delete
    end

    return if ["#{params[:controller]}_tag"].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing

    if single_delete_test
      single_delete_redirect
    elsif (params[:pressed].ends_with?("_edit_provider") || params[:pressed] == "configuration_manager_add_provider") && @flash_array.nil?
      if @flash_array
        show_list
        replace_gtl_main_div
      else
        javascript_redirect(:action => @refresh_partial, :id => @redirect_id)
      end
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
    end
  end

  private

  def self.model_to_name(provmodel)
    Dictionary.gettext('configuration_manager', :type => :ui_title, :translate => false)
  end

  def privilege_prefix
    "configuration_manager"
  end

  def refresh
    assert_privileges("configuration_manager_refresh_provider")
    manager_button_operation('refresh_ems', _('Refresh'))
  end

  def concrete_model
    ManageIQ::Providers::ConfigurationManager
  end

  def provider_class
    ManageIQ::Providers::Foreman::Provider
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Configuration Management")},
        {:title => _("Providers"), :url => controller_url},
      ],
    }
  end

  menu_section :conf
end

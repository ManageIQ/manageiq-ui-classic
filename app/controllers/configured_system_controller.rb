class ConfiguredSystemController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem
  end

  def self.table_name
    @table_name ||= "configured_system"
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
    if params[:pressed] == 'service_dialog_from_ct'
      create_service_dialog
      return
    end

    return if ["#{params[:controller]}_tag"].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing

    # Handle scan
    if params[:pressed] == "container_image_scan"
      scan_images

      if @lastaction == "show"
        javascript_flash
      else
        replace_main_div(:partial => "layouts/gtl")
      end
    end
  end

  private

  def textual_group_list
    [%i[properties environment os], %i[tenancy tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Configuration Management")},
        {:title => _("Configured Systems"), :url => controller_url},
      ],
    }
  end

  menu_section :conf
end

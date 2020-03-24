class ConfiguredSystemController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "configured_system"
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    model = self.class.model
    tag(model) if params[:pressed] == "configured_system_tag"
    provision if params[:pressed] == "configured_system_provision"

    return if ["#{params[:controller]}_tag"].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing
  end

  private

  def provision
    assert_privileges("configured_system_provision")
    provisioning_ids = find_records_with_rbac(ConfiguredSystem, checked_or_params).ids

    unless ConfiguredSystem.provisionable?(provisioning_ids)
      add_flash(_("Provisioning is not supported for at least one of the selected systems"), :error)
      replace_right_cell
      return
    end

    if ConfiguredSystem.common_configuration_profiles_for_selected_configured_systems(provisioning_ids)
      javascript_redirect(:controller     => "miq_request",
                          :action         => "prov_edit",
                          :prov_id        => provisioning_ids,
                          :org_controller => "configured_system",
                          :escape         => false)
    else
      render_flash(n_("No common configuration profiles available for the selected configured system",
                      "No common configuration profiles available for the selected configured systems",
                      provisioning_ids.size), :error)
    end
  end

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

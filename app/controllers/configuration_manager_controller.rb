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

  def edit
    @server_zones = Zone.visible.in_my_region.order('lower(description)').pluck(:description, :name)
    case params[:button]
    when "cancel"
      cancel_provider
    when "save"
      add_provider
      save_provider
    else
      assert_privileges("configuration_manager_edit_provider")
      manager_id            = params[:miq_grid_checks] || params[:id] || find_checked_items[0]
      @provider_manager     = find_record(concrete_model, manager_id)
      @providerdisplay_type = _("Configuration Manager")
      @sb[:action] = params[:action]
      @in_a_form = true
      @redirect_controller = "configuration_manager"
      @redirect_id = @provider_manager.id
      @refresh_partial = "edit"
    end
  end

  def form_fields
    assert_privileges("configuration_manager_edit_provider")
    # set value of read only zone text box, when there is only single zone
    if params[:id] == "new"
      return render(:json => {:zone => Zone.visible.in_my_region.size >= 1 ? Zone.visible.in_my_region.first.name : nil})
    end

    manager = find_record(concrete_model, params[:id])
    provider = manager.provider

    render :json => {:name                => provider.name,
                     :zone                => provider.zone.name,
                     :zone_hidden         => !manager.enabled?,
                     :url                 => provider.url,
                     :verify_ssl          => provider.verify_ssl,
                     :default_userid      => provider.authentications.first.userid,
                     :default_auth_status => provider.authentication_status_ok?}
  end

  def new
    assert_privileges("configuration_manager_add_provider")
    @provider_manager = concrete_model.new
    @server_zones = Zone.visible.in_my_region.order('lower(description)').pluck(:description, :name)
    @sb[:action] = params[:action]
    @in_a_form = true
    @redirect_controller = "configuration_manager"
    @refresh_partial = "new"
  end

  private

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

  def delete
    assert_privileges("configuration_manager_delete_provider")
    checked_items = find_checked_items
    checked_items.push(params[:id]) if checked_items.empty? && params[:id]
    providers = Rbac.filtered(concrete_model.where(:id => checked_items).includes(:provider).collect(&:provider))
    if providers.empty?
      add_flash(_("No Providers were selected for deletion"), :error)
    else
      providers.each do |provider|
        AuditEvent.success(
          :event        => "provider_record_delete_initiated",
          :message      => "[#{provider.name}] Record delete initiated",
          :target_id    => provider.id,
          :target_class => provider.type,
          :userid       => session[:userid]
        )
        provider.destroy_queue
      end

      add_flash(n_("Delete initiated for %{count} Provider",
                   "Delete initiated for %{count} Providers",
                   providers.length) % {:count => providers.length})
    end
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

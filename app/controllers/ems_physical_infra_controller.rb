class EmsPhysicalInfraController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon # common methods for EmsInfra/Cloud controllers
  include Mixins::EmsCommon::Angular
  include Mixins::GenericSessionMixin
  include Mixins::DashboardViewMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::PhysicalInfraManager
  end

  def self.table_name
    @table_name ||= "ems_physical_infra"
  end

  def ems_path(*args)
    ems_physical_infra_path(*args)
  end

  def new_ems_path
    new_ems_physical_infra_path
  end

  def ems_physical_infra_form_fields
    assert_privileges("#{permission_prefix}_edit")
    @ems = model.new if params[:id] == 'new'
    @ems = find_record_with_rbac(model, params[:id]) if params[:id] != 'new'

    render :json => {
      :name                      => @ems.name,
      :emstype                   => @ems.emstype,
      :zone                      => zone,
      :provider_id               => @ems.provider_id || "",
      :hostname                  => @ems.hostname,
      :default_hostname          => @ems.connection_configurations.default.endpoint.hostname,
      :default_api_port          => @ems.connection_configurations.default.endpoint.port,
      :provider_region           => @ems.provider_region,
      :default_userid            => @ems.authentication_userid || "",
      :ems_controller            => controller_name,
      :default_auth_status       => default_auth_status,
      :default_security_protocol => @ems.security_protocol || "",
    }
  end

  def display_physical_servers_with_host
    nested_list(PhysicalServer, :named_scope => :with_hosts, :breadcrumb_title => _("Physical Servers with Host"))
  end

  def launch_console
    @ems = find_record_with_rbac(model, params[:id])
    $log.info('Console URL - ' + @ems.console_url.to_s)
    javascript_open_window(@ems.console_url.to_s)
  end

  def change_password_ems_physical_infra_path(id = nil)
    "/ems_physical_infra/change_password/#{id}"
  end

  # This method handle view objects of page
  # +/ems_physical_infra/change_password/<id>+
  def change_password
    @record = find_record_with_rbac(model, params[:id])
    @title = _("Change Password for Physical Infrasctructure Provider '%{provider_name}'") % {:provider_name => @record.name}
    @in_a_form = true # to show the page on all content frame
  end

  def restful?
    true
  end

  private

  ############################
  # Special EmsCloud link builder for restful routes
  def show_link(ems, options = {})
    ems_path(ems.id, options)
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Providers"), :url => controller_url},
      ],
      :record_info => @ems,
    }.compact
  end

  menu_section :phy
  has_custom_buttons
end

class EmsPhysicalInfraController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon # common methods for EmsInfra/Cloud controllers
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
  # Special EmsPhysicalInfra link builder for restful routes
  def show_link(ems, options = {})
    ems_physical_infra_path(ems.id, options)
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

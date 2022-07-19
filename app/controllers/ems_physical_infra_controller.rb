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
    open_console('ems_physical_infra_console')
  end

  def change_password_ems_physical_infra_path(id = nil)
    "/ems_physical_infra/change_password/#{id}"
  end

  def restful?
    true
  end

  def download_data
    assert_privileges('ems_physical_infra_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('ems_physical_infra_show')
    super
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
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  has_custom_buttons
end

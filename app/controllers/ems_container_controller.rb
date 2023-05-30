class EmsContainerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon # common methods for EmsInfra/Cloud/Container controllers
  include Mixins::GenericSessionMixin
  include Mixins::DashboardViewMixin
  include Mixins::ContainersExternalLoggingSupportMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::ContainerManager
  end

  def self.table_name
    @table_name ||= "ems_container"
  end

  def show_list
    @showtype = "main"
    process_show_list(:gtl_dbname => 'emscontainer')
  end

  def show
    @breadcrumbs = [{:name => _('Containers Providers'), :url => '/ems_container/show_list'}]
    super
  end

  def restful?
    true
  end

  def download_data
    assert_privileges('ems_container_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('ems_container_show')
    super
  end

  private

  def textual_group_list
    [%i[properties endpoints status miq_custom_attributes], %i[compliance relationships smart_management]]
  end
  helper_method :textual_group_list

  ############################
  # Special EmsContainer link builder for restful routes
  def show_link(ems, options = {})
    ems_container_path(ems.id, options)
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Providers"), :url => controller_url},
      ],
      :record_info => @ems,
    }.compact
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_timeline", :tl_chooser
  feature_for_actions "#{controller_name}_perf", :perf_top_chart

  has_custom_buttons
end

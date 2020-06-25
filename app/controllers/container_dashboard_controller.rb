class ContainerDashboardController < ApplicationController
  extend ActiveSupport::Concern

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show
    assert_privileges("container_dashboard_view")

    @lastaction = "show_dashboard"
    if params[:id].nil?
      @breadcrumbs.clear
    end
    @title = title
  end

  def index
    redirect_to(:action => 'show')
  end

  def data
    assert_privileges("container_dashboard_view")

    return data_live if params[:live] == 'true'

    render :json => {:data => collect_data(params[:id])}
  end

  def heatmaps_data
    assert_privileges("container_dashboard_view")

    render :json => {:data => collect_heatmaps_data(params[:id])}
  end

  def ems_utilization_data
    assert_privileges("container_dashboard_view")

    render :json => {:data => collect_ems_utilization_data(params[:id])}
  end

  def network_metrics_data
    assert_privileges("container_dashboard_view")

    render :json => {:data => collect_network_metrics_data(params[:id])}
  end

  def pod_metrics_data
    assert_privileges("container_dashboard_view")

    render :json => {:data => collect_pod_metrics_data(params[:id])}
  end

  def image_metrics_data
    assert_privileges("container_dashboard_view")

    render :json => {:data => collect_image_metrics_data(params[:id])}
  end

  def data_live
    render :json => collect_live_data(params[:id], params[:query])
  end

  def project_data
    assert_privileges("container_dashboard_view")

    render :json => {:data => collect_project_data(params[:id]) }
  end

  def title
    _("Container Dashboard")
  end

  def self.session_key_prefix
    "container_dashboard"
  end

  private

  def get_session_data
    super
  end

  def collect_data(provider_id)
    ContainerDashboardService.new(provider_id, self).all_data
  end

  def collect_heatmaps_data(provider_id)
    ContainerDashboardService.new(provider_id, self).all_heatmaps_data
  end

  def collect_ems_utilization_data(provider_id)
    ContainerDashboardService.new(provider_id, self).ems_utilization_data
  end

  def collect_network_metrics_data(provider_id)
    ContainerDashboardService.new(provider_id, self).network_metrics_data
  end

  def collect_pod_metrics_data(provider_id)
    ContainerDashboardService.new(provider_id, self).pod_metrics_data
  end

  def collect_image_metrics_data(provider_id)
    ContainerDashboardService.new(provider_id, self).image_metrics_data
  end

  def collect_live_data(provider_id, query)
    ems = ExtManagementSystem.find(provider_id)

    if ems && ems.connection_configurations.prometheus.try(:endpoint)
      PrometheusProxyService.new(provider_id, self).data(query)
    else
      HawkularProxyService.new(provider_id, self).data(query)
    end
  end

  def collect_project_data(project_id)
    ContainerProjectDashboardService.new(project_id, self).all_data
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Overview"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt
end

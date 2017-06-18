class ContainerDashboardController < ApplicationController
  extend ActiveSupport::Concern

  include Mixins::GenericSessionMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show
    if params[:id].nil?
      @breadcrumbs.clear
    end
  end

  def index
    redirect_to :action => 'show'
  end

  def data
    case params[:live]
    when 'live'
      data_live
    when 'hawkular'
      data_live_hawkular
    when 'prometheus'
      data_live_prometheus
    else
      render :json => {:data => collect_data(params[:id])}
    end
  end

  def data_live
    ems = ExtManagementSystem.find(params[:id].to_i)
    if ems.connection_configurations.prometheus.try(:endpoint)
      data_live_prometheus
    else
      data_live_hawkular
    end
  end

  def data_live_hawkular
    render :json => collect_live_data(params[:id], params[:query])
  end

  def data_live_prometheus
    render :json => collect_live_prometheus_data(params[:id], params[:query])
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

  def collect_live_data(provider_id, query)
    HawkularProxyService.new(provider_id, self).data(query)
  end

  def collect_live_prometheus_data(provider_id, query)
    PrometheusProxyService.new(provider_id, self).data(query)
  end

  menu_section :cnt
end

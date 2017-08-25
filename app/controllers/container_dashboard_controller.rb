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
    return data_live if params[:live] == 'true'
    render :json => {:data => collect_data(params[:id])}
  end

  def data_live
    render :json => collect_live_data(params[:id], params[:query])
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
    ems = ExtManagementSystem.find(provider_id)

    if ems && ems.connection_configurations.prometheus.try(:endpoint)
      PrometheusProxyService.new(provider_id, self).data(query)
    else
      HawkularProxyService.new(provider_id, self).data(query)
    end
  end

  menu_section :cnt
end

class EmsInfraDashboardController < ApplicationController
  extend ActiveSupport::Concern

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def data
    render :json => {:data => collect_data(params[:id])}
  end

  def cluster_metrics_data
    render :json => {:data => cluster_heatmap_data(params[:id])}
  end

  def recent_hosts_data
    render :json => {:data => recent_hosts(params[:id])}
  end

  def recent_vms_data
    render :json => {:data => recent_vms(params[:id])}
  end

  def ems_utilization_data
    render :json => {:data => ems_data(params[:id])}
  end

  def aggregate_status_data
    render :json => {:data => aggregate_status(params[:id])}
  end

  private

  def collect_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self, EmsInfra).all_data
  end

  def cluster_heatmap_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self, EmsInfra).cluster_heatmap_data
  end

  def recent_hosts(ems_id)
    EmsInfraDashboardService.new(ems_id, self, EmsInfra).recent_hosts_data
  end

  def recent_vms(ems_id)
    EmsInfraDashboardService.new(ems_id, self, EmsInfra).recent_vms_data
  end

  def ems_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self, EmsInfra).ems_utilization_data
  end

  def aggregate_status(ems_id)
    EmsInfraDashboardService.new(ems_id, self, EmsInfra).aggregate_status_data
  end

  def get_session_data
    @layout = "ems_infra_dashboard"
  end

  def set_session_data
    session[:layout] = @layout
  end
end

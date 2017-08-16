class EmsInfraDashboardController < ApplicationController
  extend ActiveSupport::Concern

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show
    if params[:id].nil?
      @breadcrumbs.clear
    end
  end

  def data
    render :json => {:data => collect_data(params[:id])}
  end

  def cluster_metrics_data
    render :json => {:data => cluster_heatmap_data(params[:id])}
  end

  def recent_hosts_data
    render :json => {:data => recent_hosts_data(params[:id])}
  end

  def recent_vms_data
    render :json => {:data => recent_vms_data(params[:id])}
  end

  def ems_utilization_data
    render :json => {:data => ems_utilization_data(params[:id])}
  end

  private

  def collect_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self).all_data
  end

  def cluster_heatmap_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self).cluster_heatmap_data
  end

  def recent_hosts_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self).recent_hosts_data
  end

  def recent_vms_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self).recent_vms_data
  end

  def ems_utilization_data(ems_id)
    EmsInfraDashboardService.new(ems_id, self).ems_utilization_data
  end

  def get_session_data
    @layout = "ems_infra_dashboard"
  end

  def set_session_data
    session[:layout] = @layout
  end
end

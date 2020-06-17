class EmsCloudDashboardController < ApplicationController
  extend ActiveSupport::Concern

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def data
    render :json => {:data => collect_data(params[:id])}
  end

  def recent_instances_data
    render :json => {:data => recent_instances(params[:id])}
  end

  def recent_images_data
    render :json => {:data => recent_images(params[:id])}
  end

  def aggregate_status_data
    render :json => {:data => aggregate_status(params[:id])}
  end

  private

  def collect_data(ems_id)
    EmsCloudDashboardService.new(ems_id, self, EmsCloud).all_data
  end

  def recent_instances(ems_id)
    EmsCloudDashboardService.new(ems_id, self, EmsCloud).recent_instances_data
  end

  def recent_images(ems_id)
    EmsCloudDashboardService.new(ems_id, self, EmsCloud).recent_images_data
  end

  def get_session_data
    @layout = "ems_cloud_dashboard"
  end

  def aggregate_status(ems_id)
    EmsCloudDashboardService.new(ems_id, self, EmsCloud).aggregate_status_data
  end

  def set_session_data
    session[:layout] = @layout
  end
end

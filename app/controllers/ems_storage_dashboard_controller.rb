class EmsStorageDashboardController < ApplicationController
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

  def resources_capacity_data
    render :json => {:data => block_storage_heatmap_data(params[:id])}
  end

  def aggregate_status_data
    render :json => {:data => aggregate_status(params[:id])}
  end

  private

  def block_storage_heatmap_data(ems_id)
    EmsStorageDashboardService.new(ems_id, self, EmsStorage).block_storage_heatmap_data
  end

  def aggregate_status(ems_id)
    EmsStorageDashboardService.new(ems_id, self, EmsStorage).aggregate_status_data
  end

  def get_session_data
    @layout = "ems_storage_dashboard"
  end

  def set_session_data
    session[:layout] = @layout
  end
end

class EmsPhysicalInfraDashboardController < ApplicationController
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

  def recent_servers_data
    render :json => {:data => recent_servers(params[:id])}
  end

  private

  def recent_servers(ems_id)
    EmsPhysicalInfraDashboardService.new(ems_id, self).recent_servers_data
  end

  def get_session_data
    @layout = "ems_physical_infra_dashboard"
  end

  def set_session_data
    session[:layout] = @layout
  end
end

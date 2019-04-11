class EmsPhysicalInfraDashboardController < ApplicationController
  extend ActiveSupport::Concern

  include Mixins::GenericSessionMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def aggregate_status_data
    render :json => {:data => aggregate_status(params[:id])}
  end

  def recent_servers_data
    render :json => {:data => recent_servers(params[:id])}
  end

  def servers_group_data
    render :json => {:data => servers_group(params[:id])}
  end

  private

  def aggregate_status(ems_id)
    EmsPhysicalInfraDashboardService.new(ems_id, self).aggregate_status_data
  end

  def recent_servers(ems_id)
    EmsPhysicalInfraDashboardService.new(ems_id, self).recent_servers_data
  end

  def servers_group(ems_id)
    EmsPhysicalInfraDashboardService.new(ems_id, self).servers_group_data
  end

  def get_session_data
    @layout = "ems_physical_infra_dashboard"
  end

  def set_session_data
    session[:layout] = @layout
  end
end

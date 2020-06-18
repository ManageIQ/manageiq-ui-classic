class CloudTenantDashboardController < ApplicationController
  extend ActiveSupport::Concern

  before_action :check_privileges
  before_action :get_session_data
  before_action :get_tenant, :only => %i[data recent_instances_data recent_images_data aggregate_status_data]
  after_action :cleanup_action
  after_action :set_session_data

  def data
    render :json => {:data => collect_data}
  end

  def recent_instances_data
    render :json => {:data => recent_instances}
  end

  def recent_images_data
    render :json => {:data => recent_images}
  end

  def aggregate_status_data
    render :json => {:data => aggregate_status}
  end

  private

  def collect_data
    CloudTenantDashboardService.new(@tenant, self, CloudTenant).all_data
  end

  def recent_instances
    CloudTenantDashboardService.new(@tenant, self, CloudTenant).recent_instances_data
  end

  def recent_images
    CloudTenantDashboardService.new(@tenant, self, CloudTenant).recent_images_data
  end

  def aggregate_status
    CloudTenantDashboardService.new(@tenant, self, CloudTenant).aggregate_status_data
  end

  def get_session_data
    @layout = "cloud_tenant_dashboard"
  end

  def set_session_data
    session[:layout] = @layout
  end

  def get_tenant
    @tenant = find_record_with_rbac(CloudTenant, params[:id])
  end
end

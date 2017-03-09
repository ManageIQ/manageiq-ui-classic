class AlertsListController < ApplicationController
  extend ActiveSupport::Concern

  before_action :check_privileges
  before_action :session_data
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

  def class_icons
    res = {}
    [
      'ManageIQ::Providers::Kubernetes::ContainerManager::ContainerNode',
      'ManageIQ::Providers::Openshift::ContainerManager',
    ].each do |klass|
      listicon_image = klass.constantize.decorate.listicon_image
      res[klass] = ActionController::Base.helpers.image_path(listicon_image)
    end
    render :json => res
  end

  private

  def session_data
    @layout = "monitor_alerts_list"
  end

  def set_session_data
    session[:layout] = @layout
  end

  menu_section :monitor
end

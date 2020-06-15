class AlertsMostRecentController < ApplicationController
  extend ActiveSupport::Concern

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show
    assert_privileges('monitor_alerts_most_recent')
    if params[:id].nil?
      @breadcrumbs.clear
    end
  end

  def index
    redirect_to(:action => 'show')
  end

  private

  def session_data
    @layout = "monitor_alerts_most_recent"
  end

  def set_session_data
    session[:layout] = @layout
  end

  menu_section :monitor_alerts
end

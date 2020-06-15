class AlertsOverviewController < ApplicationController
  extend ActiveSupport::Concern
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show
    assert_privileges('monitor_alerts_overview')
    @title = _("Overview")
    if params[:id].nil?
      @breadcrumbs.clear
    end
  end

  def index
    redirect_to(:action => 'show')
  end

  private

  def session_data
    @layout = "monitor_alerts_overview"
  end

  def set_session_data
    session[:layout] = @layout
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Monitor")},
        {:title => _("Alerts")},
      ],
    }
  end

  menu_section :monitor_alerts
end

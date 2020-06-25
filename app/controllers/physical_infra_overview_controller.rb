class PhysicalInfraOverviewController < ApplicationController
  extend ActiveSupport::Concern

  include Mixins::GenericSessionMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show
    assert_privileges('physical_infra_overview_view')
    @lastaction = 'show_dashboard'
    if params[:id].nil?
      @breadcrumbs.clear
    end
  end

  def index
    redirect_to(:action => 'show')
  end

  def title
    _("Physical Providers Overview")
  end

  def self.session_key_prefix
    "physical_infra_overview"
  end

  menu_section :phy
end

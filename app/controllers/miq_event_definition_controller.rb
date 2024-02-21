class MiqEventDefinitionController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  def title
    @title = _("Events")
  end

  def show_searchbar?
    true
  end

  def show_list
    @no_checkboxes = true # Don't show checkboxes, read_only
    process_show_list(:filter => MiqPolicy.all_policy_events_filter)
  end

  def init_show
    @record = identify_record(params[:id], MiqEventDefinition)
    return false if record_no_longer_exists?(@record)

    @lastaction = 'show'
    @gtl_url = gtl_url

    unless pagination_or_gtl_request?
      @display = params[:display] || default_display
    end
    true
  end

  private

  def get_session_data
    @title = _("Events")
    @layout = "miq_event_definition"
    @lastaction = session[:miq_event_lastaction]
    @display = session[:miq_event_display]
    @current_page = session[:miq_event_current_page]
  end

  def set_session_data
    super
    session[:layout]                 = @layout
    session[:miq_event_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        {:title => _('Events'), :url => controller_url},
      ].compact,
      :record_title => :description,
    }
  end

  menu_section :con
end

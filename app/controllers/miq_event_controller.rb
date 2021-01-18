class MiqEventController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  def title
    @title = _("Events")
  end

  def show_list
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, PERPAGE_TYPES['list'], @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:request_sortcol].nil? ? 0 : session[:request_sortcol].to_i
    @sortdir = session[:request_sortdir].nil? ? "ASC" : session[:request_sortdir]
    @no_checkboxes = true # Don't show checkboxes, read_only
    # @view, @pages = get_view(MiqEvent, {:filter => MiqPolicy.all_policy_events_filter}, true)
    @view, @pages = get_view(MiqEvent, :filter => MiqPolicy.all_policy_events_filter)
    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:request_sortcol] = @sortcol
    session[:request_sortdir] = @sortdir
    {:view => @view, :pages => @pages}
  end

  def show
    @record = MiqEventDefinition.find_by(:id => params[:id])
  end

  private

  def get_session_data
    @title = _("Events")
    @layout = "miq_event"
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
        {:title => _('Events')},
      ].compact,
      :record_title => :description,
    }
  end

  menu_section :con
end

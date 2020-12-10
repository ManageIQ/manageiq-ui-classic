class MiqEventController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  def title
    @title = _("Events")
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

  def features
    [
      {
        :name     => :event,
        :title    => _("Events"),
        :role     => "event",
        :role_any => true
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        {:title => _('Explorer')},
      ].compact,
      :record_title => :description,
    }
  end

  menu_section :con
end

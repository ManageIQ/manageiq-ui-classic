class MiqTemplateController < ApplicationController
  include VmCommon
  include Mixins::GenericListMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  # Override method from Mixins::GenericListMixin
  def index
    session[:miq_template_type] = nil # Reset VM type if coming in from All tab
    redirect_to(:action => 'show_list')
  end

  private

  def record_class
    MiqTemplate
  end

  def get_session_data
    @title          = _("Templates")
    @layout         = session[:miq_template_type] || "miq_template"
    @lastaction     = session[:miq_template_lastaction]
    @showtype       = session[:miq_template_showtype]
    @filters        = session[:miq_template_filters]
    @catinfo        = session[:miq_template_catinfo]
    @display        = session[:miq_template_display]
    @polArr         = session[:polArr] || "" # current tags in effect
    @policy_options = session[:policy_options] || ""
  end

  def set_session_data
    session[:miq_template_lastaction]   = @lastaction
    session[:miq_template_showtype]     = @showtype
    session[:miq_compressed]            = @compressed unless @compressed.nil?
    session[:miq_exists_mode]           = @exists_mode unless @exists_mode.nil?
    session[:miq_template_filters]      = @filters
    session[:miq_template_catinfo]      = @catinfo
    session[:miq_template_display]      = @display unless @display.nil?
    session[:polArr]                    = @polArr unless @polArr.nil?
    session[:policy_options]            = @policy_options unless @policy_options.nil?
  end

  has_custom_buttons
end

class MiqPolicyController < ApplicationController
  include_concern 'Events'
  include_concern 'Policies'

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericToolbarMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin


  def title
    @title = _("Policies")
  end

  def index
    flash_to_session
    redirect_to(:action => 'show_list')
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    @refresh_div = "main_div" # Default div for button.rjs to refresh

    unless @refresh_partial # if no button handler ran, show not implemented msg
      add_flash(_("Button not yet implemented"), :error)
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    end
  end

  POLICY_X_BUTTON_ALLOWED_ACTIONS = {
    'miq_policy_copy'            => :miq_policy_copy,
    'miq_policy_edit'            => :miq_policy_edit,
    'miq_policy_new'             => :miq_policy_edit,
    'miq_policy_edit_conditions' => :miq_policy_edit,
    'miq_policy_edit_events'     => :miq_policy_edit,
    'miq_event_edit'             => :miq_event_edit,
  }.freeze

  def x_button
    generic_x_button(POLICY_X_BUTTON_ALLOWED_ACTIONS)
  end

  # Get information for a policy
  def show
    super
    @center_toolbar = self.class.toolbar_singular if self.class.toolbar_singular
    @record = @policy = MiqPolicy.find_by(:id => params[:id])
    @policy_conditions = @policy.conditions
    @policy_events = @policy.miq_event_definitions
    @expression_table = @policy.expression.kind_of?(MiqExpression) ? exp_build_table(@policy.expression.exp) : nil
    @policy_profiles = @policy.memberof.sort_by { |pp| pp.description.downcase }
  end

  def new
    miq_policy_edit
  end

  def edit
    @_params[:id] ||= find_checked_items[0]
    miq_policy_edit
  end

  private

  def get_record_display_name(record)
    record.description
  end

  def get_session_data
    @title = _("Policies")
    @layout = "miq_policy"
    @lastaction = session[:miq_policy_lastaction]
    @display = session[:miq_policy_display]
    @current_page = session[:miq_policy_current_page]
  end

  def set_session_data
    super
    session[:layout]                  = @layout
    session[:miq_policy_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        menu_breadcrumb,
      ].compact,
      :record_title => :description,
    }
  end

  def menu_breadcrumb
    {:title => _('Explorer')}
  end

  toolbar :miq_policy, :miq_policies
  menu_section :con
end

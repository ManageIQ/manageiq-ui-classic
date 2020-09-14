class MiqEventController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  def title
    @title = _("Events")
  end

  def index
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def explorer
    @breadcrumbs = []
    @explorer = true

    self.x_active_tree ||= 'event_tree'
    self.x_active_accord ||= 'event'

    build_accordions_and_trees
    get_node_info(x_node)

    render :layout => "application"
  end

  # Item clicked on in the explorer right cell
  def x_show
    @explorer = true
    tree_select
  end

  def accordion_select
    self.x_active_accord = params[:id].sub(/_accord$/, '')
    self.x_active_tree   = "#{self.x_active_accord}_tree"
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def tree_select
    # set these when a link on one of the summary screen was pressed
    self.x_active_accord = params[:accord]           if params[:accord]
    self.x_active_tree   = "#{params[:accord]}_tree" if params[:accord]
    self.x_active_tree   = params[:tree]             if params[:tree]
    self.x_node          = params[:id]

    @sb[:action] = nil
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def search
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node)
  end

  private

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, show_list = true)
    @show_list = show_list
    _modelname, nodeid, @nodetype = TreeBuilder.extract_node_model_and_id(valid_active_node(treenodeid))
    node_ids = {}
    treenodeid.split("_").each do |p|
      # Create a hash of all record ids represented by the selected tree node
      node_ids[p.split("-").first] = p.split("-").last
    end
    @sb[:node_ids] ||= {}
    @sb[:node_ids][x_active_tree] = node_ids
    x_node == "root" ? event_get_all : event_get_info(MiqEventDefinition.find(nodeid))
    @show_adv_search = @nodetype == "root"
    {:view => @view, :pages => @pages}
  end

  # replace_trees can be an array of tree symbols to be replaced
  def replace_right_cell(options = {})
    nodetype, replace_trees, presenter = options.values_at(:nodetype, :replace_trees, :presenter)
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    replace_trees = Array(replace_trees)
    @explorer = true

    c_tb = build_toolbar(center_toolbar_filename)

    # Build a presenter to render the JS
    presenter ||= ExplorerPresenter.new(
      :active_tree => x_active_tree,
      :open_accord => params[:accord]
    )

    presenter[:osf_node] = x_node

    # Replace right side with based on selected tree node type
    case nodetype
    when 'root'
      partial_name, model = ['event_list', _('Events')]
      presenter.update(:main_div, r[:partial => partial_name])
      right_cell_text = _("All %{models}") % {:models => model}
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && %w[alert_profile_tree condition_tree policy_tree].exclude?(x_active_tree.to_s)
    when 'ev'
      presenter.update(:main_div, r[:partial => 'event_details', :locals => {:read_only => true}])
      options = {:name => @event.description}
      right_cell_text = @edit ? _("Editing Event \"%{name}\"") % options : _("Event \"%{name}\"") % options
    end
    presenter[:right_cell_text] = @right_cell_text = right_cell_text

    presenter.reload_toolbars(:center => c_tb)

    if ((@edit && @edit[:new]) || @assign) && params[:action] != "x_search_by_name"
      locals = {
        :action_url => @sb[:action],
        :record_id  => @edit ? @edit[:rec_id] : @assign[:rec_id],
      }
      presenter.hide(:toolbar)
      # If was hidden for summary screen and there were no records on show_list
      presenter.show(:paging_div, :form_buttons_div)
      presenter.update(:form_buttons_div, r[:partial => "layouts/x_edit_buttons", :locals => locals])
    else
      # Added so buttons can be turned off even tho div is not being displayed it still pops up
      # Abandon changes box when trying to change a node on tree after saving a record
      presenter.hide(:buttons_on).show(:toolbar).hide(:paging_div)
    end

    presenter.hide(:form_buttons_div) if options[:remove_form_buttons]

    replace_search_box(presenter, :nameonly => true)

    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(@show_adv_search, :adv_searchbox_div)

    presenter[:record_id] = @record.try(:id)

    presenter[:lock_sidebar] = (@edit || @assign) && params[:action] != "x_search_by_name"

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  def send_button_changes
    if @edit
      @changed = (@edit[:new] != @edit[:current])
    elsif @assign
      @changed = (@assign[:new] != @assign[:current])
    end
    render :update do |page|
      page << javascript_prologue
      if @edit
        if @refresh_inventory
          page.replace("action_options_div", :partial => "action_options")
        end
        if @action_type_changed || @snmp_trap_refresh
          page.replace("action_options_div", :partial => "action_options")
        elsif @alert_refresh
          page.replace("alert_details_div",  :partial => "alert_details")
        elsif @to_email_refresh
          page.replace("edit_to_email_div",
                       :partial => "layouts/edit_to_email",
                       :locals  => {:action_url => "alert_field_changed", :record => @alert})
        elsif @alert_snmp_refresh
          page.replace("alert_snmp_div", :partial => "alert_snmp")
        elsif @alert_mgmt_event_refresh
          page.replace("alert_mgmt_event_div", :partial => "alert_mgmt_event")
        end
      elsif @assign
        if params.key?(:chosen_assign_to) || params.key?(:chosen_cat)
          page.replace("alert_profile_assign_div", :partial => "alert_profile_assign")
        end
      end
      page << javascript_for_miq_button_visibility_changed(@changed)
      page << "miqSparkle(false);"
    end
  end

  def event_get_all
    @events = MiqPolicy.all_policy_events.sort_by { |e| e.description.downcase }
    set_search_text
    @events = apply_search_filter(@search_text, @events) if @search_text.present?
    @right_cell_text = _("All Events")
    @right_cell_div = "event_list"
  end

  # Get information for an event
  def event_get_info(event)
    @record = @event = event
    @policy = MiqPolicy.find(@sb[:node_ids][x_active_tree]["p"]) unless x_active_tree == :event_tree
    @right_cell_text = _("Event \"%{name}\"") % {:name => event.description}
    @right_cell_div = "event_details"

    if x_active_tree == :event_tree
      @event_policies = @event.miq_policies.sort_by { |p| p.description.downcase }
    else
      @event_true_actions = MiqPolicy.find(@sb[:node_ids][x_active_tree]["p"]).actions_for_event(event, :success)
      @event_false_actions = MiqPolicy.find(@sb[:node_ids][x_active_tree]["p"]).actions_for_event(event, :failure)
    end
  end

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

class MiqAlertSetController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  UI_FOLDERS = [Host, Vm, ContainerReplicator, ContainerGroup, ContainerNode, ContainerImage, ContainerProject, ExtManagementSystem, PhysicalServer].freeze

  def title
    @title = _("Policies")
  end

  def index
    flash_to_session
    redirect_to(:action => 'explorer')
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

  ALERT_SET_X_BUTTON_ALLOWED_ACTIONS = {
    'miq_alert_set_assign'   => :miq_alert_set_assign,
    'miq_alert_set_edit'     => :miq_alert_set_edit,
    'miq_alert_set_new'      => :miq_alert_set_edit,
  }.freeze

  def x_button
    generic_x_button(ALERT_SET_X_BUTTON_ALLOWED_ACTIONS)
  end

  def explorer
    @breadcrumbs = []
    @explorer = true
    session[:export_data] = nil

    self.x_active_tree ||= 'alert_profile_tree'
    self.x_active_accord ||= 'alert_profile'

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
    replace_right_cell(:nodetype => "xx")
  end

  def alert_profile_load
    @alert_profile = @edit[:alert_profile_id] ? MiqAlertSet.find_by(:id => @edit[:alert_profile_id]) : MiqAlertSet.new
  end

  def alert_profile_edit_cancel
    return unless alert_profile_edit_load_edit

    @sb[:action] = @edit = nil
    if @alert_profile && @alert_profile.id.blank?
      add_flash(_("Add of new Alert Profile was cancelled by the user"))
    else
      add_flash(_("Edit of Alert Profile \"%{name}\" was cancelled by the user") % {:name => @alert_profile.description})
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype, :remove_form_buttons => true)
  end

  def alert_profile_edit_reset
    alert_profile_build_edit_screen
    @sb[:action] = "miq_alert_set_edit"
    if params[:button] == 'reset'
      add_flash(_("All changes have been reset"), :warning)
    end
    replace_right_cell(:nodetype => "ap")
  end

  def alert_profile_edit_save_add
    assert_privileges("miq_alert_set_#{@alert_profile.id ? "edit" : "new"}")
    add_flash(_("Alert Profile must contain at least one Alert"), :error) if @edit[:new][:alerts].empty?

    alert_profile = @alert_profile.id.blank? ? MiqAlertSet.new : MiqAlertSet.find(@alert_profile.id) # Get new or existing record
    alert_profile.description = @edit[:new][:description]
    alert_profile.notes = @edit[:new][:notes]
    alert_profile.mode = @edit[:new][:mode]

    unless alert_profile.valid? && !@flash_array && alert_profile.save
      alert_profile.errors.each do |field, msg|
        add_flash("#{field.to_s.capitalize} #{msg}", :error)
      end
      replace_right_cell(:nodetype => "ap")
      return
    end

    alerts = alert_profile.members                        # Get the sets members
    current = alerts.collect(&:id)                        # Build an array of the current alert ids
    mems = @edit[:new][:alerts].invert                    # Get the ids from the member list box
    begin
      alerts.each { |a| alert_profile.remove_member(MiqAlert.find(a)) unless mems.include?(a.id) } # Remove any alerts no longer in the members list box
      mems.each_key { |m| alert_profile.add_member(MiqAlert.find(m)) unless current.include?(m) }  # Add any alerts not in the set
    rescue StandardError => bang
      add_flash(_("Error during 'Alert Profile %{params}': %{message}") %
                  {:params => params[:button], :message => bang.message}, :error)
    end
    AuditEvent.success(build_saved_audit(alert_profile, @edit))
    flash_key = params[:button] == "save" ? _("Alert Profile \"%{name}\" was saved") : _("Alert Profile \"%{name}\" was added")
    add_flash(flash_key % {:name => @edit[:new][:description]})
    alert_profile_get_info(MiqAlertSet.find(alert_profile.id))
    @sb[:action] = @edit = nil
    self.x_node = @new_alert_profile_node = "xx-#{alert_profile.mode}_ap-#{alert_profile.id}"
    get_node_info(@new_alert_profile_node)
    replace_right_cell(:nodetype => "ap", :replace_trees => %i[alert_profile], :remove_form_buttons => true)
  end

  def alert_profile_edit_move
    handle_selection_buttons(:alerts)
    session[:changed] = (@edit[:new] != @edit[:current])
    replace_right_cell(:nodetype => "ap")
  end

  def alert_profile_edit_load_edit
    # Load @edit/vars for other buttons
    id = params[:id] || 'new'
    return false unless load_edit("alert_profile_edit__#{id}", "replace_cell__explorer")

    alert_profile_load
    true
  end

  def miq_alert_set_edit
    case params[:button]
    when 'cancel'
      alert_profile_edit_cancel
    when 'reset', nil # Reset or first time in
      alert_profile_edit_reset
    when 'save', 'add'
      return unless alert_profile_edit_load_edit

      alert_profile_edit_save_add
    when 'move_right', 'move_left', 'move_allleft'
      return unless alert_profile_edit_load_edit

      alert_profile_edit_move
    end
  end

  def miq_alert_set_assign
    assert_privileges("miq_alert_set_assign")
    @assign = @sb[:assign]
    @alert_profile = @assign[:alert_profile] if @assign
    case params[:button]
    when "cancel"
      @assign = nil
      add_flash(_("Edit Alert Profile assignments cancelled by user"))
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype)
    when "save"
      if @assign[:new][:assign_to].to_s.ends_with?("-tags") && !@assign[:new][:cat]
        add_flash(_("A Tag Category must be selected"), :error)
      elsif @assign[:new][:assign_to] && @assign[:new][:assign_to] != "enterprise" && @assign[:new][:objects].empty?
        add_flash(_("At least one Selection must be checked"), :error)
      end
      unless flash_errors?
        alert_profile_assign_save
        add_flash(_("Alert Profile \"%{alert_profile}\" assignments successfully saved") %
                    {:alert_profile => @alert_profile.description})
        get_node_info(x_node)
        @assign = nil
      end
      replace_right_cell(:nodetype => "ap")
    when "reset", nil # Reset or first time in
      alert_profile_build_assign_screen
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "ap")
    end
  end

  def alert_profile_field_changed
    return unless load_edit("alert_profile_edit__#{params[:id]}", "replace_cell__explorer")

    @alert_profile = @edit[:alert_profile_id] ? MiqAlertSet.find(@edit[:alert_profile_id]) : MiqAlertSet.new

    @edit[:new][:description] = params[:description].presence if params[:description]
    @edit[:new][:notes] = params[:notes].presence if params[:notes]

    send_button_changes
  end

  def alert_profile_assign_changed
    @assign = @sb[:assign]
    @alert_profile = @assign[:alert_profile]

    if params.key?(:chosen_assign_to)
      @assign[:new][:assign_to] = params[:chosen_assign_to].presence
      @assign[:new][:cat] = nil # Clear chosen tag category
    end

    @assign[:new][:cat] = params[:chosen_cat].blank? ? nil : params[:chosen_cat].to_i if params.key?(:chosen_cat)
    if params.key?(:chosen_assign_to) || params.key?(:chosen_cat)
      @assign[:new][:objects] = []                      # Clear selected objects
      @assign[:obj_tree] = alert_profile_build_obj_tree # Build the selection tree
    end
    if params.key?(:id)
      if params[:check] == "1"
        @assign[:new][:objects].push(params[:id].split("-").last.to_i)
        @assign[:new][:objects].sort!
      else
        @assign[:new][:objects].delete(params[:id].split("-").last.to_i)
      end
    end

    send_button_changes
  end

  private

  def alert_profile_get_assign_to_objects_empty?
    return true if @assign[:new][:assign_to].blank?
    return true if @assign[:new][:assign_to] == "enterprise"
    return true if @assign[:new][:assign_to].ends_with?("-tags") && @assign[:new][:cat].blank?

    false
  end

  # Build the assign objects selection tree
  def alert_profile_build_obj_tree
    return nil if alert_profile_get_assign_to_objects_empty?

    if @assign[:new][:assign_to] == "ems_folder"
      instantiate_tree("TreeBuilderEmsFolders", :ems_folders_tree,
                       @assign[:new][:objects].collect { |f| "EmsFolder_#{f}" })
    elsif @assign[:new][:assign_to] == "resource_pool"
      instantiate_tree("TreeBuilderResourcePools", :resource_pools_tree,
                       @assign[:new][:objects].collect { |f| "ResourcePool_#{f}" })
    else
      instantiate_tree("TreeBuilderAlertProfileObj", :object_tree, @assign[:new][:objects])
    end
  end

  def instantiate_tree(tree_class, tree_name, selected_nodes)
    tree_class.constantize.new(tree_name,
                               @sb,
                               true,
                               :assign_to      => @assign[:new][:assign_to],
                               :cat            => @assign[:new][:cat],
                               :selected_nodes => selected_nodes)
  end

  def alert_profile_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    @alert_profile = params[:id] ? MiqAlertSet.find(params[:id]) : MiqAlertSet.new # Get existing or new record
    @edit[:key] = "alert_profile_edit__#{@alert_profile.id || "new"}"
    @edit[:rec_id] = @alert_profile.id || nil

    @edit[:alert_profile_id] = @alert_profile.id
    @edit[:new][:description] = @alert_profile.description
    @edit[:new][:notes] = @alert_profile.notes
    @edit[:new][:mode] = @alert_profile.mode || @sb[:folder] # Use existing model or model from selected folder

    @edit[:new][:alerts] = {}
    alerts = @alert_profile.members # Get the set's members
    alerts.each { |a| @edit[:new][:alerts][a.description] = a.id } # Build a hash for the members list box

    @edit[:choices] = {}
    MiqAlert.where(:db => @edit[:new][:mode]).select(:id, :description).each do |a|
      @edit[:choices][a.description] = a.id # Build a hash for the alerts to choose from
    end

    @edit[:new][:alerts].each_key do |key|
      @edit[:choices].delete(key) # Remove any alerts that are in the members list box
    end

    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true
    @in_a_form = true
    @edit[:current][:add] = true unless @edit[:alert_profile_id] # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def alert_profile_build_assign_screen
    @assign = {}
    @assign[:new] = {}
    @assign[:current] = {}
    @sb[:action] = "miq_alert_set_assign"
    @assign[:rec_id] = params[:id]

    @alert_profile = MiqAlertSet.find(params[:id])            # Get existing record
    @assign[:alert_profile] = @alert_profile

    @assign[:cats] = {}
    Classification.categories.find_all { |c| !c.read_only? && c.show && !c.entries.empty? }
      .each { |c| @assign[:cats][c.id] = c.description }

    @assign[:new][:assign_to] = nil
    @assign[:new][:cat] = nil
    @assign[:new][:objects] = []
    aa = @alert_profile.get_assigned_tos
    if !aa[:objects].empty?                                   # Objects are assigned
      if aa[:objects].first.kind_of?(MiqEnterprise)           # Assigned to Enterprise object
        @assign[:new][:assign_to] = "enterprise"
      else                                                    # Assigned to CIs
        @assign[:new][:assign_to] = aa[:objects].first.class.base_class.to_s.underscore
        @assign[:new][:objects] = aa[:objects].collect(&:id).sort!
      end
    elsif !aa[:tags].empty?                                   # Tags are assigned
      @assign[:new][:assign_to] = aa[:tags].first.last + "-tags"
      @assign[:new][:cat] = aa[:tags].first.first.parent_id
      @assign[:new][:objects] = aa[:tags].collect { |o| o.first.id }
    end
    @assign[:obj_tree] = alert_profile_build_obj_tree         # Build the selection tree

    @assign[:current] = copy_hash(@assign[:new])

    @embedded = true
    @in_a_form = true
    session[:changed] = (@assign[:new] != @assign[:current])
  end

  # Save alert profile assignments
  def alert_profile_assign_save
    @alert_profile.remove_all_assigned_tos                # Remove existing assignments
    if @assign[:new][:assign_to]                          # If an assignment is selected
      if @assign[:new][:assign_to] == "enterprise"        # Assign to enterprise
        @alert_profile.assign_to_objects(MiqEnterprise.first)
      elsif @assign[:new][:assign_to].ends_with?("-tags") # Assign to selected tags
        @alert_profile.assign_to_tags(@assign[:new][:objects], @assign[:new][:assign_to].split("-").first)
      elsif @assign[:new][:assign_to]                     # Assign to selected objects
        @alert_profile.assign_to_objects(@assign[:new][:objects], @assign[:new][:assign_to])
      end
    end
  end

  def alert_profile_get_all_folders
    @ap_folders = MiqAlert.base_tables.sort_by { |db| ui_lookup(:model => db) }.collect do |db|
      [ui_lookup(:model => db), db]
    end
    @right_cell_text = _("All Alert Profiles")
    @right_cell_div = "alert_profile_folders"
  end

  # Get information for an alert profile
  def alert_profile_get_info(alert_profile)
    @record = @alert_profile = alert_profile
    aa = @alert_profile.get_assigned_tos
    @alert_profile_tag = Classification.find(aa[:tags].first.first.parent_id) unless aa[:tags].empty?
    @alert_profile_alerts = @alert_profile.miq_alerts.sort_by { |a| a.description.downcase }
    @right_cell_text = _("Alert Profile \"%{name}\"") % {:name => alert_profile.description}
    @right_cell_div = "alert_profile_details"
  end

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
    get_root_node_info if x_node == "root" # Get node info of tree roots
    folder_get_info(treenodeid) if treenodeid != "root" # Get folder info for all node types
    alert_profile_get_info(MiqAlertSet.find(nodeid)) if @nodetype == 'ap'
    @show_adv_search = @nodetype == "xx" && !@folders
    {:view => @view, :pages => @pages}
  end

  # Fetches right side info if a tree root is selected
  def get_root_node_info
    alert_profile_get_all_folders
  end

  # replace_trees can be an array of tree symbols to be replaced
  def replace_right_cell(options = {})
    nodetype, replace_trees, presenter = options.values_at(:nodetype, :replace_trees, :presenter)
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    replace_trees = Array(replace_trees)
    @explorer = true

    trees = build_replaced_trees(replace_trees, %i[policy action alert_profile alert])

    c_tb = build_toolbar(center_toolbar_filename)

    # Build a presenter to render the JS
    presenter ||= ExplorerPresenter.new(
      :active_tree => x_active_tree,
      :open_accord => params[:accord]
    )

    self.x_node = @new_alert_profile_node if @new_alert_profile_node

    reload_trees_by_presenter(presenter, trees)

    presenter[:osf_node] = x_node

    @changed = session[:changed] if @edit # to get save/reset buttons to highlight when fields are moved left/right

    # Replace right side with based on selected tree node type
    case nodetype
    when 'root'
      partial_name, model = ['alert_profile_folders', _('Alert Profiles')]
      presenter.update(:main_div, r[:partial => partial_name])
      right_cell_text = _("All %{models}") % {:models => model}
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && %w[alert_profile_tree policy_tree].exclude?(x_active_tree.to_s)
    when 'xx'
      presenter.update(
        :main_div,
        if @alert_profiles
          right_cell_text = _("All %{typ} Alert Profiles") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
          r[:partial => 'alert_profile_list']
        end
      )
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && !@folders
    when 'ap'
      presenter.update(:main_div, r[:partial => 'alert_profile_details', :locals => {:read_only => true}])
      right_cell_text = if @alert_profile.id.blank?
                          _("Adding a new Alert Profile")
                        elsif @edit
                          _("Editing %{model} Alert Profile \"%{name}\"") % {:name  => @alert_profile.description,
                                                                             :model => ui_lookup(:model => @edit[:new][:mode])}
                        else
                          _("Alert Profile \"%{name}\"") % {:name => @alert_profile.description}
                        end
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

  def get_session_data
    @title = _("Alert Profiles")
    @layout =  "miq_alert_set"
    @lastaction = session[:miq_alert_set_lastaction]
    @display = session[:miq_alert_set_display]
    @current_page = session[:miq_alert_set_current_page]
  end

  def set_session_data
    super
    session[:layout]                     = @layout
    session[:miq_alert_set_current_page] = @current_page
  end

  def features
    [
      {
        :name     => :alert_profile,
        :title    => _("Alert Profiles"),
        :role     => "alert_profile",
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

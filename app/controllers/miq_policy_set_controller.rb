class MiqPolicySetController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  UI_FOLDERS = [Host, Vm, ContainerReplicator, ContainerGroup, ContainerNode, ContainerImage, ContainerProject, ExtManagementSystem, PhysicalServer].freeze

  def title
    @title = _("Policy Profiles")
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

  POLICY_SET_X_BUTTON_ALLOWED_ACTIONS = {
    'miq_policy_set_edit' => :miq_policy_set_edit,
    'miq_policy_set_new'  => :miq_policy_set_edit,
  }.freeze

  def x_button
    generic_x_button(POLICY_SET_X_BUTTON_ALLOWED_ACTIONS)
  end

  def explorer
    @breadcrumbs = []
    @explorer = true

    self.x_active_tree ||= 'policy_profile_tree'
    self.x_active_accord ||= 'policy_profile'

    build_accordions_and_trees

    if params[:profile].present? # If profile record id passed in, position on that node
      self.x_active_tree = 'policy_profile_tree'
      profile_id = params[:profile].to_i
      if MiqPolicySet.exists?(:id => profile_id)
        self.x_node = "pp-#{profile_id}"
      else
        add_flash(_("Policy Profile no longer exists"), :error)
        self.x_node = "root"
      end
    end
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

  def miq_policy_set_edit
    case params[:button]
    when "cancel"
      @sb[:action] = @edit = nil
      @profile = MiqPolicySet.find(session[:edit][:profile_id]) if session[:edit] && session[:edit][:profile_id]
      if @profile.blank?
        add_flash(_("Add of new Policy Profile was cancelled by the user"))
      else
        add_flash(_("Edit of Policy Profile \"%{name}\" was cancelled by the user") % {:name => @profile.description})
      end
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype, :remove_form_buttons => true)
      return
    when "reset", nil # Reset or first time in
      profile_build_edit_screen
      @sb[:action] = "miq_policy_set_edit"
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "pp")
      return
    end

    # Load @edit/vars for other buttons
    id = params[:id] || "new"
    return unless load_edit("profile_edit__#{id}", "replace_cell__explorer")

    @profile = @edit[:profile_id] ? MiqPolicySet.find(@edit[:profile_id]) : MiqPolicySet.new

    case params[:button]
    when "save", "add"
      assert_privileges("profile_#{@profile.id ? "edit" : "new"}")
      add_flash(_("Policy Profile must contain at least one Policy"), :error) if @edit[:new][:policies].length.zero? # At least one member is required
      profile = @profile.id.blank? ? MiqPolicySet.new : MiqPolicySet.find(@profile.id) # Get new or existing record
      profile.description = @edit[:new][:description]
      profile.notes = @edit[:new][:notes]
      if profile.valid? && !@flash_array && profile.save
        policies = profile.members               # Get the sets members
        current = []
        policies.each { |p| current.push(p.id) } # Build an array of the current policy ids
        mems = @edit[:new][:policies].invert     # Get the ids from the member list box
        begin
          policies.each { |c| profile.remove_member(c) unless mems.include?(c.id) } # Remove any policies no longer in the members list box
          mems.each_key { |m| profile.add_member(MiqPolicy.find(m)) unless current.include?(m) } # Add any policies not in the set
        rescue => bang
          add_flash(_("Error during 'Policy Profile %{params}': %{messages}") %
                      {:params => params[:button], :messages => bang.message}, :error)
        end
        AuditEvent.success(build_saved_audit(profile, @edit))
        if params[:button] == "save"
          add_flash(_("Policy Profile \"%{name}\" was saved") % {:name => @edit[:new][:description]})
        else
          add_flash(_("Policy Profile \"%{name}\" was added") % {:name => @edit[:new][:description]})
        end
        profile_get_info(MiqPolicySet.find(profile.id))
        @edit = nil
        @nodetype = "pp"
        @new_profile_node = "pp-#{profile.id}"
        replace_right_cell(:nodetype => "pp", :replace_trees => %i[policy_profile], :remove_form_buttons => true)
      else
        profile.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        replace_right_cell(:nodetype => "pp")
      end
    when "move_right", "move_left", "move_allleft"
      handle_selection_buttons(:policies)
      session[:changed] = (@edit[:new] != @edit[:current])
      replace_right_cell(:nodetype => "pp")
    end
  end

  def profile_field_changed
    return unless load_edit("profile_edit__#{params[:id]}", "replace_cell__explorer")

    @profile = @edit[:profile_id] ? MiqPolicySet.find(@edit[:profile_id]) : MiqPolicySet.new

    @edit[:new][:description] = params[:description].presence if params[:description]
    @edit[:new][:notes] = params[:notes].presence if params[:notes]

    send_button_changes
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
    get_root_node_info if x_node == "root" # Get node info of tree roots
    profile_get_info(MiqPolicySet.find(nodeid)) if @nodetype == 'pp'
    @show_adv_search = (@nodetype == "xx"   && !@folders) ||
                       (@nodetype == "root" && !%i[alert_profile_tree condition_tree policy_tree].include?(x_active_tree))
    {:view => @view, :pages => @pages}
  end

  # Fetches right side info if a tree root is selected
  def get_root_node_info
    profile_get_all
  end

  # replace_trees can be an array of tree symbols to be replaced
  def replace_right_cell(options = {})
    nodetype, replace_trees, presenter = options.values_at(:nodetype, :replace_trees, :presenter)
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    replace_trees = Array(replace_trees)
    @explorer = true

    trees = build_replaced_trees(replace_trees, %i[policy_profile policy event condition action alert_profile alert])

    c_tb = build_toolbar(center_toolbar_filename)

    # Build a presenter to render the JS
    presenter ||= ExplorerPresenter.new(
      :active_tree => x_active_tree,
      :open_accord => params[:accord]
    )

    # Simply replace the tree partials to reload the trees
    replace_trees.each do |name|
      case name
      when :policy_profile
        self.x_node = @new_profile_node if @new_profile_node
      else
        raise _("unknown tree in replace_trees: %{name}") % {name => name}
      end
    end
    reload_trees_by_presenter(presenter, trees)

    presenter[:osf_node] = x_node

    @changed = session[:changed] if @edit # to get save/reset buttons to highlight when fields are moved left/right

    # Replace right side with based on selected tree node type
    case nodetype
    when 'root'
      partial_name, model =
        case x_active_tree
        when :policy_profile_tree then ['profile_list', _('Policy Profiles')]
        end

      presenter.update(:main_div, r[:partial => partial_name])
      right_cell_text = _("All %{models}") % {:models => model}
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && %w[alert_profile_tree condition_tree policy_tree].exclude?(x_active_tree.to_s)
    when 'pp'
      presenter.update(:main_div, r[:partial => 'profile_details'])
      right_cell_text =
        if @profile && @profile.id.blank?
          _("Adding a new Policy Profile")
        else
          msg = @edit ? _("Editing Policy Profile \"%{name}\"") : _("Policy Profile \"%{name}\"")
          msg % {:name  => @profile.description}
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

  def send_button_changes
    if @edit
      @changed = (@edit[:new] != @edit[:current])
    elsif @assign
      @changed = (@assign[:new] != @assign[:current])
    end
    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility_changed(@changed)
      page << "miqSparkle(false);"
    end
  end

  def profile_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    @profile = params[:id] ? MiqPolicySet.find(params[:id]) : MiqPolicySet.new # Get existing or new record
    @edit[:key] = "profile_edit__#{@profile.id || "new"}"
    @edit[:rec_id] = @profile.id || nil

    @edit[:profile_id] = @profile.id
    @edit[:new][:description] = @profile.description
    @edit[:new][:notes] = @profile.notes

    @edit[:new][:policies] = {}
    policies = @profile.members # Get the member sets
    policies.each { |p| @edit[:new][:policies][ui_lookup(:model => p.towhat) + " #{p.mode.capitalize}: " + p.description] = p.id } # Build a hash for the members list box

    @edit[:choices] = {}
    MiqPolicy.all.each do |p|
      @edit[:choices][ui_lookup(:model => p.towhat) + " #{p.mode.capitalize}: " + p.description] = p.id # Build a hash for the policies to choose from
    end

    @edit[:new][:policies].each_key do |key|
      @edit[:choices].delete(key) # Remove any policies that are in the members list box
    end

    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true
    @in_a_form = true
    @edit[:current][:add] = true if @edit[:profile_id].blank? # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def profile_get_all
    @profiles = MiqPolicySet.all.sort_by { |ps| ps.description.downcase }
    set_search_text
    @profiles = apply_search_filter(@search_text, @profiles) if @search_text.present?
    @right_cell_text = _("All Policy Profiles")
    @right_cell_div = "profile_list"
  end

  # Get information for a profile
  def profile_get_info(profile)
    @record = @profile = profile
    @profile_policies = @profile.miq_policies.sort_by { |p| [p.towhat, p.mode, p.description.downcase] }
    @right_cell_text = _("Policy Profile \"%{name}\"") % {:name => @profile.description}
    @right_cell_div = "profile_details"
  end

  def get_session_data
    @title = _("Policy Profiles")
    @layout = "miq_policy_set"
    @lastaction = session[:miq_policy_set_lastaction]
    @display = session[:miq_policy_set_display]
    @current_page = session[:miq_policy_set_current_page]
  end

  def set_session_data
    super
    session[:layout]                      = @layout
    session[:miq_policy_set_current_page] = @current_page
  end

  def features
    [
      {
        :name     => :policy_profile,
        :title    => _("Policy Profiles"),
        :role     => "policy_profile",
        :role_any => true
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        {:title => _('Policy Profile Explorer')},
      ].compact,
      :record_title => :description,
    }
  end

  menu_section :con
end

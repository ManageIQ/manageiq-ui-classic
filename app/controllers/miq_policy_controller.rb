class MiqPolicyController < ApplicationController
  include_concern 'Events'
  include_concern 'Policies'

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
    if params[:pressed] == "refresh_log"
      refresh_log
      return
    end

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

  def explorer
    assert_privileges('control_explorer')
    @breadcrumbs = []
    @explorer = true

    self.x_active_tree ||= 'policy_tree'
    self.x_active_accord ||= 'policy'

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

    assert_accordion_and_tree_privileges(x_active_tree)

    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def tree_select
    # set these when a link on one of the summary screen was pressed
    self.x_active_accord = params[:accord]           if params[:accord]
    self.x_active_tree   = "#{params[:accord]}_tree" if params[:accord]
    self.x_active_tree   = params[:tree]             if params[:tree]
    self.x_node          = params[:id]

    assert_accordion_and_tree_privileges(x_active_tree)

    @sb[:action] = nil
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def search
    get_node_info(x_node)
    case x_active_tree
    when "profile", "action", "alert"
      replace_right_cell(:nodetype => x_node)
    when "policy"
      replace_right_cell(:nodetype => "xx")
    end
  end

  def log
    assert_privileges('policy_log')
    @breadcrumbs = []
    @log = $policy_log.contents(nil, 1000)
    add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
    @lastaction = "policy_logs"
    @layout = "miq_policy_logs"
    @msg_title = "Policy"
    @download_action = "fetch_log"
    @server_options ||= {}
    @server_options[:server_id] ||= MiqServer.my_server.id
    @server = MiqServer.my_server
    drop_breadcrumb(:name => _("Log"), :url => "/miq_ae_policy/log")
    render :action => "show"
  end

  def refresh_log
    assert_privileges('policy_log')
    @log = $policy_log.contents(nil, 1000)
    @server = MiqServer.my_server
    add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
    replace_main_div(:partial => "layouts/log_viewer")
  end

  # Send the log in text format
  def fetch_log
    assert_privileges('policy_log')
    disable_client_cache
    send_data($policy_log.contents(nil, nil),
              :filename => "policy.log")
    AuditEvent.success(:userid  => session[:userid],
                       :event   => "download_policy_log",
                       :message => "Policy log downloaded")
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
    folder_get_info(treenodeid) if treenodeid != "root" # Get folder info for all node types
    policy_get_info(MiqPolicy.find(nodeid)) if @nodetype == 'p'
    @show_adv_search = (@nodetype == "xx" && !@folders)
    {:view => @view, :pages => @pages}
  end

  # Fetches right side info if a tree root is selected
  def get_root_node_info
    policy_get_all_folders
  end

  # replace_trees can be an array of tree symbols to be replaced
  def replace_right_cell(options = {})
    nodetype, replace_trees, presenter = options.values_at(:nodetype, :replace_trees, :presenter)
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    replace_trees = Array(replace_trees)
    @explorer = true

    trees = build_replaced_trees(replace_trees, %i[policy action alert])

    c_tb = build_toolbar(center_toolbar_filename)

    # Build a presenter to render the JS
    presenter ||= ExplorerPresenter.new(
      :active_tree => x_active_tree,
      :open_accord => params[:accord]
    )

    self.x_node = @new_policy_node if @new_policy_node
    reload_trees_by_presenter(presenter, trees)

    presenter[:osf_node] = x_node

    @changed = session[:changed] if @edit # to get save/reset buttons to highlight when fields are moved left/right

    # Replace right side with based on selected tree node type
    if @sb[:mode] == 'compliance'
      case @sb[:nodeid]
      when 'host'
        summary = _("All Host Compliance Policies")
        adding = _("Adding a new Host Compliance Policy")
        editing = @edit ? _("Editing Host Compliance Policy \"%{name}\"") : _("Host Compliance Policy \"%{name}\"")
      when 'vm'
        summary = _("All VM and Instance Compliance Policies")
        adding = _("Adding a new VM and Instance Compliance Policy")
        editing = @edit ? _("Editing VM and Instance Compliance Policy \"%{name}\"") : _("VM and Instance Compliance Policy \"%{name}\"")
      when 'containerReplicator'
        summary = _("All Container Replicator Compliance Policies")
        adding = _("Adding a new Container Replicator Compliance Policy")
        editing = @edit ? _("Editing Container Replicator Compliance Policy \"%{name}\"") : _("Container Replicator Compliance Policy \"%{name}\"")
      when 'containerGroup'
        summary = _("All Container Pod Compliance Policies")
        adding = _("Adding a new Container Pod Compliance Policy")
        editing = @edit ? _("Editing Container Pod Compliance Policy \"%{name}\"") : _("Container Pod Compliance Policy \"%{name}\"")
      when 'containerNode'
        summary = _("All Container Node Compliance Policies")
        adding = _("Adding a new Container Node Compliance Policy")
        editing = @edit ? _("Editing Container Node Compliance Policy \"%{name}\"") : _("Container Node Compliance Policy \"%{name}\"")
      when 'containerImage'
        summary = _("All Container Image Compliance Policies")
        adding = _("Adding a new Container Image Compliance Policy")
        editing = @edit ? _("Editing Container Image Compliance Policy \"%{name}\"") : _("Container Image Compliance Policy \"%{name}\"")
      when 'containerProject'
        summary = _("All Container Project Compliance Policies")
        adding = _("Adding a new Container Project Compliance Policy")
        editing = @edit ? _("Editing Container Project Compliance Policy \"%{name}\"") : _("Container Project Compliance Policy \"%{name}\"")
      when 'extManagementSystem'
        summary = _("All Provider Compliance Policies")
        adding = _("Adding a new Provider Compliance Policy")
        editing = @edit ? _("Editing Provider Compliance Policy \"%{name}\"") : _("Provider Compliance Policy \"%{name}\"")
      when 'physicalServer'
        summary = _("All Physical Server Compliance Policies")
        adding = _("Adding a new Physical Server Compliance Policy")
        editing = @edit ? _("Editing Physical Server Compliance Policy \"%{name}\"") : _("Physical Server Compliance Policy \"%{name}\"")
      else
        summary = _("All %{model} Compliance Policies")
        adding = _("Adding a new %{model} Compliance Policy")
        editing = @edit ? _("Editing %{model} Compliance Policy \"%{name}\"") : _("%{model} Compliance Policy \"%{name}\"")
      end
    elsif @sb[:mode] == 'control'
      case @sb[:nodeid]
      when 'host'
        summary = _("All Host Control Policies")
        adding = _("Adding a new Host Control Policy")
        editing = @edit ? _("Editing Host Control Policy \"%{name}\"") : _("Host Control Policy \"%{name}\"")
      when 'vm'
        summary = _("All VM and Instance Control Policies")
        adding = _("Adding a new VM and Instance Control Policy")
        editing = @edit ? _("Editing VM and Instance Control Policy \"%{name}\"") : _("VM and Instance Control Policy \"%{name}\"")
      when 'containerReplicator'
        summary = _("All Container Replicator Control Policies")
        adding = _("Adding a new Container Replicator Control Policy")
        editing = @edit ? _("Editing Container Replicator Control Policy \"%{name}\"") : _("Container Replicator Control Policy \"%{name}\"")
      when 'containerGroup'
        summary = _("All Container Pod Control Policies")
        adding = _("Adding a new Container Pod Control Policy")
        editing = @edit ? _("Editing Container Pod Control Policy \"%{name}\"") : _("Container Pod Control Policy \"%{name}\"")
      when 'containerNode'
        summary = _("All Container Node Control Policies")
        adding = _("Adding a new Container Node Control Policy")
        editing = @edit ? _("Editing Container Node Control Policy \"%{name}\"") : _("Container Node Control Policy \"%{name}\"")
      when 'containerImage'
        summary = _("All Container Image Control Policies")
        adding = _("Adding a new Container Image Control Policy")
        editing = @edit ? _("Editing Container Image Control Policy \"%{name}\"") : _("Container Image Control Policy \"%{name}\"")
      when 'containerProject'
        summary = _("All Container Project Control Policies")
        adding = _("Adding a new Container Project Control Policy")
        editing = @edit ? _("Editing Container Project Control Policy \"%{name}\"") : _("Container Project Control Policy \"%{name}\"")
      when 'extManagementSystem'
        summary = _("All Provider Control Policies")
        adding = _("Adding a new Provider Control Policy")
        editing = @edit ? _("Editing Provider Control Policy \"%{name}\"") : _("Provider Control Policy \"%{name}\"")
      when 'physicalServer'
        summary = _("All Physical Server Control Policies")
        adding = _("Adding a new Physical Server Control Policy")
        editing = @edit ? _("Editing Physical Server Control Policy \"%{name}\"") : _("Physical Server Control Policy \"%{name}\"")
      else
        summary = _("All %{model} Control Policies")
        adding = _("Adding a new %{model} Control Policy")
        editing = @edit ? _("Editing %{model} Control Policy \"%{name}\"") : _("%{model} Control Policy \"%{name}\"")
      end
    else
      summary = _("All %{model} %{mode} Policies")
      adding = _("Adding a new %{model} %{mode} Policy")
      editing = @edit ? _("Editing %{model} %{mode} Policy \"%{name}\"") : _("%{model} %{mode} Policy \"%{name}\"")
    end

    case nodetype
    when 'root'
      partial_name, model = ['policy_folders', _('Policies')]
      presenter.update(:main_div, r[:partial => partial_name])
      right_cell_text = _("All %{models}") % {:models => model}
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && %w[policy_tree].exclude?(x_active_tree.to_s)
    when 'xx'
      presenter.update(
        :main_div,
        if @policies || (@view && @sb[:tree_typ] == 'policies')
          options = {:mode => @sb[:mode] ? _(@sb[:mode].capitalize) : "", :model => ui_lookup(:model => @sb[:nodeid].try(:camelize))}
          right_cell_text = summary % options
          r[:partial => 'policy_list']
        elsif @folders
          mode = @sb[:folder]
          right_cell_text = if mode == 'compliance'
                              _('Compliance Policies')
                            elsif mode == 'control'
                              _('Control Policies')
                            else
                              _("%{typ} Policies") % {:typ => mode.capitalize}
                            end
          r[:partial => 'policy_folders']
        end
      )
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && !@folders
    when 'p'
      presenter.update(:main_div, r[:partial => 'policy_details', :locals => {:read_only => true}])
      if @policy.id.blank?
        options = {:mode => @sb[:mode] ? _(@sb[:mode].capitalize) : "", :model => ui_lookup(:model => @sb[:nodeid].try(:camelize))}
        right_cell_text = adding % options
      else
        options = {:mode => @sb[:mode] ? _(@sb[:mode].capitalize) : "", :model => ui_lookup(:model => @sb[:nodeid].try(:camelize)), :name => @policy.description}
        right_cell_text = editing % options
        if @edit && @edit[:typ] == 'conditions'
          right_cell_text += _(" Condition Assignments")
        end
        if @edit && @edit[:typ] == 'events'
          right_cell_text += _(" Event Assignments")
        end
      end
    when 'ev'
      presenter.update(:main_div, r[:partial => 'event_edit', :locals => {:read_only => true}])
      right_cell_text = _("Edit Actions for \"%{name}\" Event") % {:name => @policy.description}
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
      presenter.remove_paging
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

  # Get list of folder contents
  def folder_get_info(folder_node)
    nodetype, nodeid = folder_node.split("_")
    @sb[:mode] = nil
    @sb[:nodeid] = nil
    @sb[:folder] = nodeid.nil? ? nodetype.split("-").last : nodeid
    if nodeid.nil? && %w[compliance control].include?(nodetype.split('-').last)
      # level 1 - compliance & control
      _, mode = nodetype.split('-')
      @folders = UI_FOLDERS.collect do |model|
        "#{model.name.titleize} #{mode.titleize}"
      end
      @right_cell_text = case mode
                         when 'compliance' then _('Compliance Policies')
                         when 'control'    then _('Control Policies')
                         else _("%{typ} Policies") % {:typ => mode.titleize}
                         end
    else
      # level 2 - host, vm, etc. under compliance/control - OR deeper levels
      @sb[:mode] = nodeid.split("-")[1]
      @sb[:nodeid] = nodeid.split("-").last
      @sb[:folder] = "#{nodeid.split("-")[1]}-#{nodeid.split("-")[2]}"
      set_search_text
      policy_get_all if folder_node.split("_").length <= 2
      @right_cell_text = _("All %{typ} Policies") % {:typ => ui_lookup(:model => @sb[:nodeid].try(:camelize))}
      @right_cell_div = "policy_list"
    end
  end

  def get_session_data
    @title = _("Policies")
    @layout = "miq_policy"
    @lastaction = session[:miq_policy_lastaction]
    @display = session[:miq_policy_display]
    @current_page = session[:miq_policy_current_page]
    @server_options = session[:server_options] if session[:server_options]
  end

  def set_session_data
    super
    session[:layout]                  = @layout
    session[:miq_policy_current_page] = @current_page
    session[:server_options]          = @server_options
  end

  def features
    [
      {
        :name     => :policy,
        :title    => _("Policies"),
        :role     => "policy",
        :role_any => true
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        menu_breadcrumb,
      ].compact,
      :not_tree     => %w[log].include?(action_name),
      :record_title => :description,
    }
  end

  def menu_breadcrumb
    return nil if %w[log].include?(action_name)

    {:title => _('Explorer')}
  end

  menu_section :con
  feature_for_actions %w[
    alert_new
    alert_copy
    alert_edit
    condition_new
    condition_copy
    condition_policy_copy
    condition_edit
    policy_new
    policy_copy
    policy_edit
  ], *EXP_EDITOR_ACTIONS
end

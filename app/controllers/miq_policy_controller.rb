class MiqPolicyController < ApplicationController
  include_concern 'MiqActions'
  include_concern 'AlertProfiles'
  include_concern 'Alerts'
  include_concern 'Conditions'
  include_concern 'Events'
  include_concern 'Policies'
  include_concern 'PolicyProfiles'
  include_concern 'Rsop'

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  UI_FOLDERS = [Host, Vm, ContainerReplicator, ContainerGroup, ContainerNode, ContainerImage, ContainerProject, ExtManagementSystem, PhysicalServer].freeze

  def title
    @title = _("Policies")
  end

  def index
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def export
    @breadcrumbs = []
    @layout = "miq_policy_export"
    drop_breadcrumb(:name => _("Import / Export"), :url => "miq_policy/export")
    case params[:button]
    when "cancel"
      @sb = nil
      if @lastaction != "fetch_yaml"
        add_flash(_("Export cancelled by user"))
      end
      javascript_redirect(:action => "explorer")
    when "export"
      @sb[:new][:choices_chosen] = params[:choices_chosen] || []
      if @sb[:new][:choices_chosen].empty? # At least one member is required
        add_flash(_("At least 1 item must be selected for export"), :error)
        render :update do |page|
          page << javascript_prologue
          page.replace_html("profile_export_div", :partial => "export")
          page << "miqSparkle(false);"
        end
        return
      end
      begin
        (db, filename) = case @sb[:dbtype]
                         when 'pp' then [MiqPolicySet, 'Profiles']
                         when 'p'  then [MiqPolicy, 'Policies']
                         when 'al' then [MiqAlert, 'Alerts']
                         end
        session[:export_data] = MiqPolicy.export_to_yaml(@sb[:new][:choices_chosen], db)
        javascript_redirect(:action => 'fetch_yaml', :fname => filename, :escape => false)
      rescue StandardError => bang
        add_flash(_("Error during export: %{error_message}") % {:error_message => bang.message}, :error)
        render :update do |page|
          page << javascript_prologue
          page.replace_html("profile_export_div", :partial => "export")
          page << "miqSparkle(false);"
        end
      end
    when "reset", nil # Reset or first time in
      dbtype = params[:dbtype].nil? ? "pp" : params[:dbtype]
      type = params[:typ].nil? ? "export" : params[:typ]

      export_chooser(dbtype, type)
    end
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
    'action_delete'          => :action_delete,
    'action_edit'            => :action_edit,
    'action_new'             => :action_edit,
    'alert_delete'           => :alert_delete,
    'alert_edit'             => :alert_edit,
    'alert_copy'             => :alert_edit,
    'alert_new'              => :alert_edit,
    'alert_profile_assign'   => :alert_profile_assign,
    'alert_profile_delete'   => :alert_profile_delete,
    'alert_profile_edit'     => :alert_profile_edit,
    'alert_profile_new'      => :alert_profile_edit,
    'condition_delete'       => :condition_delete,
    'condition_edit'         => :condition_edit,
    'condition_copy'         => :condition_edit,
    'condition_policy_copy'  => :condition_edit,
    'condition_new'          => :condition_edit,
    'condition_remove'       => :condition_remove,
    'event_edit'             => :event_edit,
    'profile_delete'         => :profile_delete,
    'profile_edit'           => :profile_edit,
    'profile_new'            => :profile_edit,
    'policy_copy'            => :policy_copy,
    'policy_delete'          => :policy_delete,
    'policy_edit'            => :policy_edit,
    'policy_new'             => :policy_edit,
    'policy_edit_conditions' => :policy_edit,
    'policy_edit_events'     => :policy_edit,
  }.freeze

  def x_button
    generic_x_button(POLICY_X_BUTTON_ALLOWED_ACTIONS)
  end

  # Send the zipped up logs and zip files
  def fetch_yaml
    @lastaction = "fetch_yaml"
    file_name = "#{params[:fname]}_#{format_timezone(Time.now, Time.zone, "export_filename")}.yaml"
    disable_client_cache
    send_data(session[:export_data], :filename => file_name)
    session[:export_data] = nil
  end

  def upload
    redirect_options = {:action => 'import', :dbtype => params[:dbtype]}

    @sb[:conflict] = false
    if upload_file_valid?
      begin
        import_file_upload = miq_policy_import_service.store_for_import(params[:upload][:file])
        @sb[:hide] = true
        redirect_options[:import_file_upload_id] = import_file_upload.id
      rescue StandardError => err
        flash_to_session(_("Error during 'Policy Import': %{messages}") % {:messages => err.message}, :error)
        redirect_options[:action] = 'export'
      end
    else
      flash_to_session(_("Use the Choose file button to locate an Import file"), :error)
      redirect_options[:action] = 'export'
    end

    redirect_to(redirect_options)
  end

  def get_json
    import_file_upload = ImportFileUpload.find(params[:import_file_upload_id])
    policy_import_json = import_as_json(import_file_upload.policy_import_data)

    respond_to do |format|
      format.json { render :json => policy_import_json }
    end
  end

  def import
    @breadcrumbs = []
    @layout = "miq_policy_export"
    @import_file_upload_id = params[:import_file_upload_id]
    drop_breadcrumb(:name => _("Import / Export"), :url => "miq_policy/export")

    if params[:commit] == "import"
      begin
        miq_policy_import_service.import_policy(@import_file_upload_id)
      rescue StandardError => bang
        add_flash(_("Error during upload: %{messages}") % {:messages => bang.message}, :error)
      else
        @sb[:hide] = false
        add_flash(_("Import file was uploaded successfully"))
      end

      render :update do |page|
        page << javascript_prologue
        page.replace_html("profile_export_div", :partial => "export")
        page << "miqSparkle(false);"
      end
    elsif params[:commit] == "cancel"
      miq_policy_import_service.cancel_import(@import_file_upload_id)

      flash_to_session(_("Import cancelled by user"))
      javascript_redirect(:action => 'export')

    # init import
    else
      @import = iterate_status(ImportFileUpload.find(@import_file_upload_id).policy_import_data)
      if @sb[:conflict]
        add_flash(_("Import not available due to conflicts"), :error)
      else
        add_flash(_("Press commit to Import")) unless @flash_array
      end
      render :action => "import", :layout => true
    end
  end

  def export_field_changed
    prev_dbtype = @sb[:dbtype]
    export_chooser(params[:dbtype], "export") if params[:dbtype]
    @sb[:new][:choices_chosen] = params[:choices_chosen] || []
    render :update do |page|
      page << javascript_prologue
      if prev_dbtype != @sb[:dbtype] # If any export db type has changed
        page.replace_html("profile_export_div", :partial => "export")
      end
    end
  end

  def explorer
    @breadcrumbs = []
    @explorer = true
    session[:export_data] = nil

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
    case x_active_tree
    when "profile", "event", "action", "alert"
      replace_right_cell(:nodetype => x_node)
    when "policy", "condition", "alert_profile"
      replace_right_cell(:nodetype => "xx")
    end
  end

  def log
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
    @log = $policy_log.contents(nil, 1000)
    @server = MiqServer.my_server
    add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
    replace_main_div(:partial => "layouts/log_viewer")
  end

  # Send the log in text format
  def fetch_log
    disable_client_cache
    send_data($policy_log.contents(nil, nil),
              :filename => "policy.log")
    AuditEvent.success(:userid  => session[:userid],
                       :event   => "download_policy_log",
                       :message => "Policy log downloaded")
  end

  private

  def import_as_json(yaml_array)
    iterate_status(yaml_array) if yaml_array
  end

  def iterate_status(items = nil, result = [], parent_id = nil)
    items.each do |item|
      entry = {
        :id     => result.count.to_s,
        :type   => ui_lookup(:model => item[:class]),
        :title  => item[:description],
        :parent => parent_id,
        :icon   => get_status_icon(item[:status])
      }

      if item[:messages]
        entry['msg'] = item[:messages].join(', ')
        @sb[:conflict] = true
      end

      result << entry

      # recursive call if item have the childrens
      if item[:children]
        iterate_status(item[:children], result, result.count - 1)
      end
    end

    result
  end

  def get_status_icon(status)
    case status
    when :update then "import-update"
    when :add then "import-add"
    when :conflict then "import-conflict"
    end
  end

  def miq_policy_import_service
    @miq_policy_import_service ||= MiqPolicyImportService.new
  end

  def upload_file_valid?
    params.fetch_path(:upload, :file).respond_to?(:read)
  end

  def peca_get_all(what, get_view)
    @no_checkboxes       = true
    @showlinks           = true
    @lastaction          = "#{what}_get_all"
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    if params[:ppsetting]                                               # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                         # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    sortcol_key = "#{what}_sortcol".to_sym
    sortdir_key = "#{what}_sortdir".to_sym
    @sortcol    = (session[sortcol_key] || 0).to_i
    @sortdir    =  session[sortdir_key] || 'ASC'
    set_search_text
    @_params[:search_text] = @search_text if @search_text && @_params[:search_text] # Added to pass search text to get_view method
    @view, @pages = get_view.call # Get the records (into a view) and the paginator
    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[sortcol_key]     = @sortcol
    session[sortdir_key]     = @sortdir

    if pagination_or_gtl_request? && @show_list
      render :update do |page|
        page << javascript_prologue
        page.replace("gtl_div", :partial => "layouts/gtl", :locals => {:action_url => "#{what}_get_all", :button_div => 'policy_bar'})
        page << "miqSparkleOff();"
      end
    end

    @sb[:tree_typ]   = what.pluralize
    @right_cell_text = _("All %{items}") % {:items => what.pluralize.titleize}
    @right_cell_div  = "#{what}_list"
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
    case @nodetype
    when "pp" # Policy Profile
      profile_get_info(MiqPolicySet.find(nodeid))
    when "p"  # Policy
      policy_get_info(MiqPolicy.find(nodeid))
    when "co" # Condition
      condition_get_info(Condition.find(nodeid))
    when "ev" # Event
      event_get_info(MiqEventDefinition.find(nodeid))
    when "a", "ta", "fa" # Action or True/False Action
      action_get_info(MiqAction.find(nodeid))
    when "ap" # Alert Profile
      alert_profile_get_info(MiqAlertSet.find(nodeid))
    when "al" # Alert
      alert_get_info(MiqAlert.find(nodeid))
    end
    @show_adv_search = (@nodetype == "xx"   && !@folders) ||
                       (@nodetype == "root" && !%i[alert_profile_tree condition_tree policy_tree].include?(x_active_tree))
    {:view => @view, :pages => @pages}
  end

  # Fetches right side info if a tree root is selected
  def get_root_node_info
    case x_active_tree
    when :policy_profile_tree
      profile_get_all
    when :policy_tree
      policy_get_all_folders
    when :event_tree
      event_get_all
    when :condition_tree
      condition_get_all_folders
    when :action_tree
      action_get_all
    when :alert_profile_tree
      alert_profile_get_all_folders
    when :alert_tree
      alert_get_all
    end
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
      when :policy
        self.x_node = @new_policy_node if @new_policy_node
      when :event
        nil
      when :condition
        self.x_node = @new_condition_node if @new_condition_node
      when :action
        self.x_node = @new_action_node if @new_action_node
      when :alert_profile
        self.x_node = @new_alert_profile_node if @new_alert_profile_node
      when :alert
        self.x_node = @new_alert_node if @new_alert_node
      else
        raise _("unknown tree in replace_trees: %{name}") % {name => name}
      end
    end
    reload_trees_by_presenter(presenter, trees)

    if params[:action].ends_with?('_delete') &&
       !x_node.starts_with?('p') &&
       !x_node.starts_with?('co')
      nodes = x_node.split('_')
      nodes.pop
      self.x_node = nodes.join("_")
    end
    presenter[:osf_node] = x_node

    @changed = session[:changed] if @edit # to get save/reset buttons to highlight when fields are moved left/right

    # Replace right side with based on selected tree node type
    case nodetype
    when 'root'
      partial_name, model =
        case x_active_tree
        when :policy_profile_tree then ['profile_list',          _('Policy Profiles')]
        when :policy_tree         then ['policy_folders',        _('Policies')]
        when :event_tree          then ['event_list',            _('Events')]
        when :condition_tree      then ['condition_folders',     _('Conditions')]
        when :action_tree         then ['action_list',           _('Actions')]
        when :alert_profile_tree  then ['alert_profile_folders', _('Alert Profiles')]
        when :alert_tree          then ['alert_list',            _('Alerts')]
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
    when 'xx'
      presenter.update(
        :main_div,
        if @profiles
          r[:partial => 'profile_list']
        elsif @policies || (@view && @sb[:tree_typ] == 'policies')
          right_cell_text = _("All %{typ} Policies") % {:typ => "#{ui_lookup(:model => @sb[:nodeid].try(:camelize))} #{@sb[:mode] ? _(@sb[:mode].capitalize) : ""}"}
          r[:partial => 'policy_list']
        elsif @conditions
          right_cell_text = _("All %{typ} Conditions") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
          r[:partial => 'condition_list']
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
        elsif @alert_profiles
          right_cell_text = _("All %{typ} Alert Profiles") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
          r[:partial => 'alert_profile_list']
        end
      )
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && !@folders
    when 'p'
      presenter.update(:main_div, r[:partial => 'policy_details', :locals => {:read_only => true}])
      model_name = ui_lookup(:model => @sb[:nodeid].try(:camelize))
      if @policy.id.blank?
        right_cell_text = if @sb[:mode]
                            _("Adding a new %{model_name} %{mode} Policy") %
                              {:model_name => model_name, :mode => _(@sb[:mode].capitalize)}
                          else
                            _("Adding a new %{model_name} Policy") % {:model_name => model_name}
                          end
      else
        options = {:model => "#{model_name} #{@sb[:mode] ? _(@sb[:mode].capitalize) : ""}",
                   :name  => @policy.description}
        right_cell_text = @edit ? _("Editing %{model} Policy \"%{name}\"") % options : _("%{model} Policy \"%{name}\"") % options
        if @edit && @edit[:typ] == 'conditions'
          right_cell_text += _(" Condition Assignments")
        end
        if @edit && @edit[:typ] == 'events'
          right_cell_text += _(" Event Assignments")
        end
      end
    when 'co'
      # Set the JS types and titles vars if value fields are showing (needed because 2 expression editors are present)
      if @edit && @edit[@expkey]
        %i[val1 val2].each do |val|
          next unless @edit[@expkey][val] # unless an expression with value 1 is showing

          presenter[:exp] = {}
          presenter[:exp]["#{val}_type".to_sym]  = @edit[@expkey][val][:type].to_s if @edit[@expkey][val][:type]
          presenter[:exp]["#{val}_title".to_sym] = @edit[@expkey][val][:title]     if @edit[@expkey][val][:title]
        end
      end
      presenter.update(:main_div, r[:partial => 'condition_details', :locals => {:read_only => true}])
      right_cell_text = if @condition.id.blank?
                          _("Adding a new Condition")
                        elsif @edit
                          _("Editing %{model} Condition \"%{name}\"") %
                            {:name  => @condition.description,
                             :model => ui_lookup(:model => @edit[:new][:towhat])}
                        else
                          _("%{model} Condition \"%{name}\"") %
                            {:name  => @condition.description,
                             :model => ui_lookup(:model => @condition.towhat)}
                        end
    when 'ev'
      presenter.update(:main_div, r[:partial => 'event_details', :locals => {:read_only => true}])
      options = {:name => @event.description}
      right_cell_text = @edit ? _("Editing Event \"%{name}\"") % options : _("Event \"%{name}\"") % options
    when 'a', 'ta', 'fa'
      presenter.update(:main_div, r[:partial => 'action_details', :locals => {:read_only => true}])
      right_cell_text = if @action.id.blank?
                          _("Adding a new Action")
                        else
                          msg = @edit ? _("Editing Action \"%{name}\"") : _("Action \"%{name}\"")
                          msg % {:name => @action.description}
                        end
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
    when 'al'
      presenter.update(:main_div, r[:partial => 'alert_details', :locals => {:read_only => true}])
      right_cell_text = if @alert.id.blank?
                          _("Adding a new Alert")
                        elsif @assign && @edit
                          _("Editing assignments for Alert \"%{name}\"") % {:name => @alert.description}
                        elsif @assign
                          _("Assignments for Alert \"%{name}\"") % {:name => @alert.description}
                        elsif @edit
                          _("Editing Alert \"%{name}\"") % {:name => @alert.description}
                        else
                          _("Alert \"%{name}\"") % {:name => @alert.description}
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

  def handle_selection_buttons_left(members, members_chosen, choices, _choices_chosen)
    if params[members_chosen].nil?
      add_flash(_("No %{members} were selected to move left") % {:members => members.to_s.split("_").first.titleize},
                :error)
      return
    end

    if @edit[:event_id]
      # Handle Actions for an Event
      params[members_chosen].each do |mc|
        idx = nil
        # Find the index of the new members array
        @edit[:new][members].each_with_index { |mem, i| idx = mem[-1] == mc.to_i ? i : idx }
        next if idx.nil?

        desc = @edit[:new][members][idx][0].slice(4..-1) # Remove (x) prefix from the chosen item
        @edit[choices][desc] = mc.to_i # Add item back into the choices hash
        @edit[:new][members].delete_at(idx) # Remove item from the array
      end
    else
      mems = @edit[:new][members].invert
      params[members_chosen].each do |mc|
        @edit[choices][mems[mc.to_i]] = mc.to_i
        @edit[:new][members].delete(mems[mc.to_i])
      end
    end
  end

  def handle_selection_buttons_right(members, _members_chosen, choices, choices_chosen)
    if params[choices_chosen].nil?
      add_flash(_("No %{member} were selected to move right") %
        {:member => members.to_s.split("_").first.titleize}, :error)
      return
    end

    mems = @edit[choices].invert
    if @edit[:event_id]
      # Handle Actions for an Event
      params[choices_chosen].each do |mc|
        # Add selection to chosen members array, default to synch = true
        @edit[:new][members].push(["(S) " + mems[mc.to_i], true, mc.to_i])
        @edit[choices].delete(mems[mc.to_i]) # Remove from the choices hash
      end
    else
      params[choices_chosen].each do |mc|
        @edit[:new][members][mems[mc.to_i]] = mc.to_i
        @edit[choices].delete(mems[mc.to_i])
      end
    end
  end

  def handle_selection_buttons_allleft(members, _members_chosen, choices, _choices_chosen)
    if @edit[:new][members].empty?
      add_flash(_("No %{member} were selected to move left") %
        {:member => members.to_s.split("_").first.titleize}, :error)
      return
    end

    if @edit[:event_id]
      # Handle Actions for an Event
      @edit[:new][members].each do |m|
        # Put description/id of each chosen member back into choices hash
        @edit[choices][m.first.slice(4..-1)] = m.last
      end
    else
      @edit[:new][members].each do |key, value|
        @edit[choices][key] = value
      end
    end
    @edit[:new][members].clear
  end

  def handle_selection_buttons_sortout_selected(members_chosen)
    if params[:button].starts_with?("true")
      @true_selected = params[members_chosen][0].to_i
    else
      @false_selected = params[members_chosen][0].to_i
    end
  end

  def handle_selection_buttons_up_down(members, members_chosen, _choices, _choices_chosen, up)
    if params[members_chosen].nil? || params[members_chosen].length != 1
      message = if up
                  _("Select only one or consecutive %{member} to move up")
                else
                  _("Select only one or consecutive %{member} to move down")
                end

      add_flash(message % {:member => members.to_s.split("_").first.singularize.titleize}, :error)
      return
    end

    handle_selection_buttons_sortout_selected(members_chosen)
    idx = nil
    mc = params[members_chosen][0]
    # Find item index in new members array
    @edit[:new][members].each_with_index { |mem, i| idx = mem[-1] == mc.to_i ? i : idx }

    return if idx.nil?
    return if up && idx.zero? # cannot go higher
    return if !up && idx >= @edit[:new][members].length - 1 # canot go lower

    pulled = @edit[:new][members].delete_at(idx)
    delta  = up ? -1 : 1
    @edit[:new][members].insert(idx + delta, pulled)
  end

  def handle_selection_buttons_sync_async(members, members_chosen, _choices, _choices_chosen, sync)
    if params[members_chosen].nil?
      msg = if sync
              _("No %{member} selected to set to Synchronous")
            else
              _("No %{member} selected to set to Asynchronous")
            end
      add_flash(msg % {:member => members.to_s.split("_").first.titleize}, :error)
      return
    end

    handle_selection_buttons_sortout_selected(members_chosen)

    params[members_chosen].each do |mc|
      idx = nil
      # Find the index in the new members array
      @edit[:new][members].each_with_index { |mem, i| idx = mem[-1] == mc.to_i ? i : idx }
      next if idx.nil?

      letter = sync ? 'S' : 'A'
      @edit[:new][members][idx][0] = "(#{letter}) " + @edit[:new][members][idx][0].slice(4..-1) # Change prefix to (A)
      @edit[:new][members][idx][1] = sync # true for sync
    end
  end

  # Handle the middle buttons on the add/edit forms
  # pass in member list symbols (i.e. :policies)
  def handle_selection_buttons(members,
                               members_chosen = :members_chosen,
                               choices = :choices,
                               choices_chosen = :choices_chosen)
    if params[:button].ends_with?("_left")
      handle_selection_buttons_left(members, members_chosen, choices, choices_chosen)
    elsif params[:button].ends_with?("_right")
      handle_selection_buttons_right(members, members_chosen, choices, choices_chosen)
    elsif params[:button].ends_with?("_allleft")
      handle_selection_buttons_allleft(members, members_chosen, choices, choices_chosen)
    elsif params[:button].ends_with?("_up")
      handle_selection_buttons_up_down(members, members_chosen, choices, choices_chosen, true)
    elsif params[:button].ends_with?("_down")
      handle_selection_buttons_up_down(members, members_chosen, choices, choices_chosen, false)
    elsif params[:button].ends_with?("_sync")
      handle_selection_buttons_sync_async(members, members_chosen, choices, choices_chosen, true)
    elsif params[:button].ends_with?("_async")
      handle_selection_buttons_sync_async(members, members_chosen, choices, choices_chosen, false)
    end
  end

  def apply_search_filter(search_str, results)
    if search_str.first == "*"
      results.delete_if { |r| !r.description.downcase.ends_with?(search_str[1..-1].downcase) }
    elsif search_str.last == "*"
      results.delete_if { |r| !r.description.downcase.starts_with?(search_str[0..-2].downcase) }
    else
      results.delete_if { |r| !r.description.downcase.include?(search_str.downcase) }
    end
  end

  def set_search_text
    @sb[:pol_search_text] ||= {}
    if params[:search_text]
      @search_text = params[:search_text].strip
      @sb[:pol_search_text][x_active_tree] = @search_text unless @search_text.nil?
    else
      @sb[:pol_search_text].delete(x_active_tree) if params[:action] == 'search_clear'
      @search_text = @sb[:pol_search_text][x_active_tree]
    end
  end

  # Get list of folder contents
  def folder_get_info(folder_node)
    nodetype, nodeid = folder_node.split("_")
    @sb[:mode] = nil
    @sb[:nodeid] = nil
    @sb[:folder] = nodeid.nil? ? nodetype.split("-").last : nodeid
    if x_active_tree == :policy_tree
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
    elsif x_active_tree == :condition_tree
      @conditions = Condition.where(:towhat => @sb[:folder].camelize).sort_by { |c| c.description.downcase }
      set_search_text
      @conditions = apply_search_filter(@search_text, @conditions) if @search_text.present?
      @right_cell_text = _("All %{typ} Conditions") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
      @right_cell_div = "condition_list"
    elsif x_active_tree == :alert_profile_tree
      @alert_profiles = MiqAlertSet.where(:mode => @sb[:folder]).sort_by { |as| as.description.downcase }
      set_search_text
      @alert_profiles = apply_search_filter(@search_text, @alert_profiles) if @search_text.present?
      @right_cell_text = _("All %{typ} Alert Profiles") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
      @right_cell_div = "alert_profile_list"
    end
  end

  # Build the audit object when a profile is saved
  def build_saved_audit(record, add = false)
    name = if record.kind_of?(MiqPolicy)
             record.description
           else
             record.respond_to?(:name) ? record.name : record.description
           end

    msg = if add
            _("[%{name}] Record added (") % {:name => name}
          else
            _("[%{name}] Record updated (") % {:name => name}
          end
    event = "#{record.class.to_s.downcase}_record_#{add ? "add" : "update"}"
    i = 0
    @edit[:new].each_key do |k|
      next if @edit[:new][k] == @edit[:current][k]

      msg += ", " if i.positive?
      i += 1
      format_args = if k == :members
                      {
                        :key     => @edit[:current][k].keys.join(","),
                        :new_key => @edit[:new][k].keys.join(",")
                      }
                    else
                      {
                        :key     => @edit[:current][k].to_s,
                        :new_key => @edit[:new][k].to_s
                      }
                    end
      format_args[:name] = k.to_s
      msg += _("%{name}:[%{key}] to [%{new_key}]") % format_args
    end
    msg += ")"
    {:event => event, :target_id => record.id, :target_class => record.class.base_class.name, :userid => session[:userid], :message => msg}
  end

  def export_chooser(dbtype = "pp", type = "export")
    @sb[:new] = {}
    @sb[:dbtype] = dbtype
    @sb[:hide] = false
    if type == "export"
      @sb[:new][:choices_chosen] = []
      @sb[:new][:choices] = []
      chooser_class =
        case dbtype
        when "pp" then MiqPolicySet
        when "p"  then MiqPolicy
        when "al" then MiqAlert
        end
      @sb[:new][:choices] = chooser_class.all.sort_by { |c| c.description.downcase }.collect { |c| [c.description, c.id] }
    else
      @sb[:import_file] = ""
    end
  end

  def validate_snmp_options(options)
    if options[:host].nil? || options[:host] == ""
      add_flash(_("Host is required"), :error)
    end

    if options[:trap_id].nil? || options[:trap_id] == ""
      trap_text = if options[:snmp_version] == "v1" || options[:snmp_version].nil?
                    _("Trap Number is required")
                  else
                    _("Trap Object ID is required")
                  end
      add_flash(trap_text, :error)
    end
    options[:variables].each_with_index do |var, _i|
      if var[:oid].blank? || var[:value].blank? || var[:var_type] == "<None>"
        if var[:oid].present? && var[:var_type] != "<None>" && var[:var_type] != "Null" && var[:value].blank?
          add_flash(_("Value missing for %{field}") % {:field => var[:oid]}, :error)
        elsif var[:oid].blank? && var[:var_type] != "<None>" && var[:var_type] != "Null" && var[:value].present?
          add_flash(_("Object ID missing for %{field}") % {:field => var[:value]}, :error)
        elsif var[:oid].present? && var[:var_type] == "<None>" && var[:value].blank?
          add_flash(_("Type missing for %{field}") % {:field => var[:oid]}, :error)
          add_flash(_("Value missing for %{field}") % {:field => var[:oid]}, :error)
        elsif var[:oid].blank? && var[:var_type] == "Null" && var[:value].blank?
          add_flash(_("Object ID missing for %{field}") % {:field => var[:var_type]}, :error)
        elsif var[:oid].blank? && var[:var_type] != "<None>" && var[:value].blank?
          add_flash(_("Object ID and Values missing for %{field}") % {:field => var[:var_type]}, :error)
        elsif var[:oid].blank? && var[:var_type] != "Null" && var[:var_type] != "<None>" && var[:value].blank?
          add_flash(_("Object ID missing for %{field}") % {:field => var[:var_type]}, :error)
        end
      end
    end
  end

  def build_snmp_options(subkey, process_variables)
    refresh = false
    @edit[:new][subkey][:host] = params[:host] if params[:host]         # Actions support a single host in this key
    @edit[:new][subkey][:host][0] = params[:host_1] if params[:host_1]  # Alerts support an array of hosts
    @edit[:new][subkey][:host][1] = params[:host_2] if params[:host_2]
    @edit[:new][subkey][:host][2] = params[:host_3] if params[:host_3]
    @edit[:new][subkey][:snmp_version] = params[:snmp_version] if params[:snmp_version]
    @edit[:new][subkey][:trap_id]      = params[:trap_id] if params[:trap_id]
    refresh = true if params[:snmp_version]
    if process_variables
      params.each do |var, _value|
        vars = var.split("__")
        next unless %w[oid var_type value].include?(vars[0])

        10.times do |i|
          f = ("oid__" + (i + 1).to_s)
          t = ("var_type__" + (i + 1).to_s)
          v = ("value__" + (i + 1).to_s)
          @edit[:new][subkey][:variables][i][:oid] = params[f] if params[f.to_s]
          @edit[:new][subkey][:variables][i][:var_type] = params[t] if params[t.to_s]
          if params[t.to_s] == "<None>" || params[t.to_s] == "Null"
            @edit[:new][subkey][:variables][i][:value] = ""
          end
          if params[t.to_s] == "<None>"
            @edit[:new][subkey][:variables][i][:oid] = ""
          end
          refresh = true if params[t.to_s]
          @edit[:new][subkey][:variables][i][:value] = params[v] if params[v.to_s]
        end
      end
    end
    refresh
  end

  def build_expression(parent, model)
    @edit[:new][:expression] = parent.expression.kind_of?(MiqExpression) ? parent.expression.exp : nil
    # Populate exp editor fields for the expression column
    @edit[:expression] ||= ApplicationController::Filter::Expression.new
    @edit[:expression][:expression] = [] # Store exps in an array
    if @edit[:new][:expression].blank?
      @edit[:expression][:expression] = {"???" => "???"}                    # Set as new exp element
      @edit[:new][:expression] = copy_hash(@edit[:expression][:expression]) # Copy to new exp
    else
      @edit[:expression][:expression] = copy_hash(@edit[:new][:expression])
    end
    @edit[:expression_table] = exp_build_table_or_nil(@edit[:expression][:expression])

    @expkey = :expression # Set expression key to expression
    @edit[@expkey].history.reset(@edit[:expression][:expression])
    @edit[:expression][:exp_table] = exp_build_table(@edit[:expression][:expression])
    @edit[:expression][:exp_model] = model
  end

  def get_session_data
    @title = _("Policies")
    @layout = if request.parameters["action"] == "wait_for_task" # Don't change layout when wait_for_task came in for RSOP
                session[:layout]
              else
                params[:action]&.starts_with?("rsop") ? "miq_policy_rsop" : "miq_policy"
              end
    @lastaction = session[:miq_policy_lastaction]
    @display = session[:miq_policy_display]
    @current_page = session[:miq_policy_current_page]
    alert_build_pulldowns
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
        :name     => :policy_profile,
        :title    => _("Policy Profiles"),
        :role     => "policy_profile",
        :role_any => true
      },
      {
        :name     => :policy,
        :title    => _("Policies"),
        :role     => "policy",
        :role_any => true
      },
      {
        :name     => :event,
        :title    => _("Events"),
        :role     => "event",
        :role_any => true
      },
      {
        :name     => :condition,
        :title    => _("Conditions"),
        :role     => "condition",
        :role_any => true
      },
      {
        :name     => :action,
        :title    => _("Actions"),
        :role     => "action",
        :role_any => true
      },
      {
        :name     => :alert_profile,
        :title    => _("Alert Profiles"),
        :role     => "alert_profile",
        :role_any => true
      },
      {
        :name     => :alert,
        :title    => _("Alerts"),
        :role     => "alert",
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
      :not_tree     => %w[rsop export log].include?(action_name),
      :record_title => :description,
    }
  end

  def menu_breadcrumb
    return nil if %w[export log].include?(action_name)

    {:title => action_name == 'rsop' ? _('Simulation') : _('Explorer')}
  end

  menu_section :con
end

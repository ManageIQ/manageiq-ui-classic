class MiqPolicyController < ApplicationController
  include_concern 'Events'
  include_concern 'Policies'
  include_concern 'Rsop'

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

  def export
    assert_privileges('policy_import_export')
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

  # Send the zipped up logs and zip files
  def fetch_yaml
    assert_privileges('policy_import_export')
    @lastaction = "fetch_yaml"
    file_name = "#{params[:fname]}_#{format_timezone(Time.now, Time.zone, "export_filename")}.yaml"
    disable_client_cache
    send_data(session[:export_data], :filename => file_name)
    session[:export_data] = nil
  end

  def upload
    assert_privileges('policy_import_export')
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
    assert_privileges('policy_import_export')
    import_file_upload = ImportFileUpload.find(params[:import_file_upload_id])
    policy_import_json = import_as_json(import_file_upload.policy_import_data)

    respond_to do |format|
      format.json { render :json => policy_import_json }
    end
  end

  def import
    assert_privileges('policy_import_export')
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
    assert_privileges('policy_import_export')
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
    assert_privileges('control_explorer')
    @breadcrumbs = []
    @explorer = true
    session[:export_data] = nil

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
          right_cell_text = _("All %{typ} Policies") % {:typ => "#{ui_lookup(:model => @sb[:nodeid].try(:camelize))} #{@sb[:mode] ? _(@sb[:mode].capitalize) : ""}"}
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

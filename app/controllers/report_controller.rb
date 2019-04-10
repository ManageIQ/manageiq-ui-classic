require 'yaml'

class ReportController < ApplicationController
  include_concern 'Dashboards'
  include_concern 'Menus'
  include_concern 'Reports'
  include_concern 'SavedReports'
  include_concern 'Schedules'
  include_concern 'Widgets'

  helper ApplicationHelper::ImportExportHelper
  include ReportHelper
  include Mixins::GenericSessionMixin
  include Mixins::SavedReportPaging
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action  :cleanup_action
  after_action  :set_session_data
  layout 'application', :except => %i[render_txt render_csv render_pdf]

  def index
    @title = _("Reports")
    redirect_to(:action => "show")
  end

  def export_field_changed
    @sb[:choices_chosen] = params[:choices_chosen] ? params[:choices_chosen].split(',') : []
    head :ok
  end

  REPORT_X_BUTTON_ALLOWED_ACTIONS = {
    'miq_report_copy'             => :miq_report_copy,
    'miq_report_delete'           => :miq_report_delete,
    'miq_report_edit'             => :miq_report_edit,
    'miq_report_new'              => :miq_report_new,
    'miq_report_run'              => :miq_report_run,
    'miq_report_schedule_add'     => :miq_report_schedule_add,
    'miq_report_schedule_edit'    => :miq_report_schedule_edit,
    'miq_report_schedule_delete'  => :miq_report_schedule_delete,
    'miq_report_schedule_enable'  => :miq_report_schedule_enable,
    'miq_report_schedule_disable' => :miq_report_schedule_disable,
    'miq_report_schedule_run_now' => :miq_report_schedule_run_now,
    'render_report_csv'           => :render_report_csv,
    'render_report_pdf'           => :render_report_pdf,
    'render_report_txt'           => :render_report_txt,
    'saved_report_delete'         => :saved_report_delete,
    'db_new'                      => :db_new,
    'db_edit'                     => :db_edit,
    'db_delete'                   => :db_delete,
    'db_seq_edit'                 => :db_seq_edit,
    'widget_refresh'              => :widget_refresh,
    'widget_new'                  => :widget_new,
    'widget_edit'                 => :widget_edit,
    'widget_copy'                 => :widget_copy,
    'widget_delete'               => :widget_delete,
    'widget_generate_content'     => :widget_generate_content,
  }.freeze

  # handle buttons pressed on the center buttons toolbar
  def x_button
    generic_x_button(REPORT_X_BUTTON_ALLOWED_ACTIONS)
  end

  def upload
    @sb[:flash_msg] = []
    if params.fetch_path(:upload, :file) && File.size(params[:upload][:file].tempfile).zero?
      redirect_to(:action      => 'explorer',
                  :flash_msg   => _("Import file cannot be empty"),
                  :flash_error => true)
      return
    end
    if params[:upload] && params[:upload][:file] && params[:upload][:file].respond_to?(:read)
      @sb[:overwrite] = params[:overwrite].present?
      @sb[:preserve_owner] = params[:preserve_owner].present?
      begin
        _reps, mri = MiqReport.import(params[:upload][:file], :save => true, :overwrite => @sb[:overwrite],
                                                            :userid => session[:userid],
                                                            :preserve_owner => @sb[:preserve_owner])
      rescue => bang
        add_flash(_("Error during 'upload': %{message}") % {:message => bang.message}, :error)
        @sb[:flash_msg] = @flash_array
        redirect_to(:action => 'explorer')
      else
        self.x_active_tree = :export_tree
        self.x_node ||= "root"
        @sb[:flash_msg] = mri
        redirect_to(:action => 'explorer')
      end
    else
      redirect_to(:action        => 'explorer',
                  :flash_msg     => _("Use the Choose file button to locate an Import file"),
                  :flash_warning => true)
    end
  end

  # New tab was pressed
  def change_tab
    case params[:tab].split("_")[0]
    when "edit"
      redirect_to(:action => "miq_report_edit", :tab => params[:tab])
    when "schedules"
      redirect_to(:action => params[:tab])
    when "saved_reports"
      redirect_to(:action => params[:tab])
    when "menueditor"
      redirect_to(:action => "menu_edit")
    else
      redirect_to(:action => params[:tab], :id => params[:id])
    end
  end

  def explorer
    @explorer = true
    @lastaction      = "explorer"
    @ght_type        = nil
    @report          = nil
    @edit            = nil
    @timeline        = true
    @timezone_abbr   = get_timezone_abbr
    @timezone_offset = get_timezone_offset
    @sb[:select_node] = false
    @trees = []
    @accords = []
    @lists = []

    x_last_active_tree = x_active_tree if x_active_tree
    x_last_active_accord = x_active_accord if x_active_accord

    # if AJAX request, replace right cell, and return
    if request.xml_http_request?
      switch_ght if params[:type]
      replace_right_cell
      return
    end

    populate_reports_menu
    build_accordions_and_trees

    self.x_active_tree = x_last_active_tree if x_last_active_tree
    self.x_active_accord = x_last_active_accord.to_s if x_last_active_accord

    @widget_nodes ||= []
    @sb[:node_clicked] = false
    x_node_set("root", :roles_tree) if params[:load_edit_err] && tree_exists?(:roles_tree)
    @flash_array = @sb[:flash_msg] if @sb[:flash_msg].present?
    get_node_info
    @right_cell_text ||= _("All Reports")
    @sb[:rep_tree_build_time] = Time.now.utc
    @sb[:active_tab] = "report_info"
    @right_cell_text.gsub!(/'/, "&apos;") # Need to escape single quote in title to load in right cell
    @x_edit_buttons_locals = set_form_locals if @in_a_form
    # show form buttons after upload is pressed
    render :layout => "application"
  end

  def accordion_select
    @sb[:flash_msg] = []
    @schedules = nil
    @edit = nil
    if params[:id]
      self.x_active_accord = params[:id].sub(/_accord$/, '')
      self.x_active_tree   = "#{x_active_accord}_tree"

      # reset menu editor to show All Roles if nothing has been changed
      x_node_set("root", :roles_tree) if !@changed && tree_exists?(:roles_tree)

      trees_to_replace = []
      trees_to_replace << :widgets if params[:id] == "widgets"
      trees_to_replace << :reports if params[:id] == "reports"

      replace_right_cell(:replace_trees => trees_to_replace)
    else
      head :ok
    end
  end

  # Item clicked on in the explorer right cell
  def x_show
    @explorer = true
    tree_select
  end

  def tree_select
    @edit = nil
    @sb[:select_node] = false
    if @sb.key?(:flash_msg)
      @flash_array = @sb[:flash_msg]
      @sb[:flash_msg] = nil
    end
    # set these when a link on one of the summary screen was pressed
    self.x_active_accord = params[:accord]           if params[:accord]
    self.x_active_tree   = "#{params[:accord]}_tree" if params[:accord]
    self.x_active_tree   = params[:tree]             if params[:tree]
    self.x_node = params[:id]
    @sb[:active_tab] = "report_info" if x_active_tree == :reports_tree && params[:action] != "reload"
    if params[:action] == "reload" && @sb[:active_tab] == "saved_reports"
      replace_right_cell(:replace_trees => %i[reports savedreports])
    else
      replace_right_cell
    end
  end

  # called to refresh report and from all saved report list view
  def get_report
    self.x_node = params[:id]
    replace_right_cell
  end

  def export_widgets
    if params[:widgets].present?
      widgets = MiqWidget.where(:id => params[:widgets])
      widget_yaml = MiqWidget.export_to_yaml(widgets, MiqWidget)
      timestamp = format_timezone(Time.current, Time.zone, "export_filename")
      send_data(widget_yaml, :filename => "widget_export_#{timestamp}.yml")
    else
      add_flash(_("At least 1 item must be selected for export"), :error)
      @sb[:flash_msg] = @flash_array
      redirect_to(:action => :explorer)
    end
  end

  def upload_widget_import_file
    upload_file = params.fetch_path(:upload, :file)

    if upload_file.blank?
      add_flash("Use the Choose file button to locate an import file", :warning)
    else
      begin
        @in_a_form = true
        import_file = widget_import_service.store_for_import(upload_file.read)
        @import_file_upload_id = import_file.id
        @import = import_file.widget_list
        add_flash(_("Import file was uploaded successfully"), :success)
      rescue WidgetImportValidator::NonYamlError
        @in_a_form = false
        add_flash(_("Error: the file uploaded is not of the supported format"), :error)
      rescue WidgetImportValidator::InvalidWidgetYamlError
        @in_a_form = false
        add_flash(_("Error: the file uploaded contains no widgets"), :error)
      end
    end

    replace_right_cell(:partial => 'export_widgets')
  end

  def import_widgets
    if params[:commit] == _('Commit')
      import_file_upload = ImportFileUpload.where(:id => params[:import_file_upload_id]).first
      if import_file_upload
        $log.info("[#{session[:userid]}] initiated import")
        if params[:widgets_to_import].nil?
          add_flash(_("Error: No widget was selected to be imported."), :error)
        else
          number = widget_import_service.import_widgets(import_file_upload, params[:widgets_to_import])
          add_flash(n_("%{number} widget imported successfully", "%{number} widgets imported successfully", number) % {:number => number})
        end
      else
        add_flash(_("Error: Widget import file upload expired"), :error)
      end
    else
      widget_import_service.cancel_import(params[:import_file_upload_id])
      add_flash(_("Widget import cancelled"), :info)
    end

    replace_right_cell(:partial => 'export_widgets')
  end

  def self.session_key_prefix
    'report'
  end

  def title
    _("Reports")
  end

  private

  def set_active_elements(feature, _x_node_to_set = nil)
    if feature
      self.x_active_tree ||= feature.tree_name
      self.x_active_accord ||= feature.accord_name
    end
    get_node_info
  end

  def features
    [
      {
        :role     => "miq_report_saved_reports",
        :role_any => true,
        :name     => :savedreports,
        :title    => _("Saved Reports")
      },
      {
        :role     => "miq_report_reports",
        :role_any => true,
        :name     => :reports,
        :title    => _("Reports")
      },
      {
        :role     => "miq_report_schedules",
        :role_any => true,
        :name     => :schedules,
        :title    => _("Schedules")
      },
      {
        :role  => "miq_report_dashboard_editor",
        :name  => :db,
        :title => _("Dashboards")
      },
      {
        :role  => "miq_report_widget_editor",
        :name  => :widgets,
        :title => _("Dashboard Widgets")
      },
      {
        :role  => "miq_report_menu_editor",
        :name  => :roles,
        :title => _("Edit Report Menus")
      },
      {
        :role  => "miq_report_export",
        :name  => :export,
        :title => _("Import/Export")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def report_selection_menus
    @folders = []
    @menu.each do |r|
      @folders.push(r[0])
      next if @edit[:new][:filter].blank?
      @sub_folders ||= []
      next unless r[0] == @edit[:new][:filter]
      r[1].each do |subfolder, reps|
        subfolder.to_miq_a.each do |s|
          @sub_folders.push(s)
        end
        @reps ||= [] if @edit[:new][:subfilter]
        get_subfilter_reports(reps) if @edit[:new][:subfilter].present? && subfolder == @edit[:new][:subfilter]
      end
    end
  end

  def get_subfilter_reports(reps)
    reports = MiqReport.where(:name => reps)
    reports.each do |report|
      next if x_active_tree == :widgets_tree && report.db == "VimPerformanceTrend"
      temp_arr = []
      temp_arr.push(report.name)
      temp_arr.push(report.id)
      @reps.push(temp_arr) unless @reps.include?(temp_arr)
    end
  end

  # Graph/Hybrid/Tabular toggle button was hit (ajax version)
  def switch_ght
    rr      = MiqReportResult.find(@sb[:pages][:rr_id])
    @report = rr.report_results # Grab the blobbed report, including table
    @html   = nil
    @render_chart = false
    if %w[tabular hybrid].include?(params[:type])
      @html = report_build_html_table(@report,
                                      rr.html_rows(:page     => @sb[:pages][:current],
                                                   :per_page => @sb[:pages][:perpage]).join)
    end
    if %w[graph hybrid].include?(params[:type])
      @render_chart = true
    end
    @ght_type = params[:type]
    @title = @report.title
  end

  def rebuild_trees
    rep = MiqReportResult.with_current_user_groups_and_report.maximum("created_on")
    return false unless rep
    build_trees = @sb[:rep_tree_build_time].nil? || rep > @sb[:rep_tree_build_time]
    # save last tree build time to decide if tree needs to be refreshed automatically
    @sb[:rep_tree_build_time] = Time.now.utc if build_trees
    build_trees
  end

  # Build the main import/export tree
  def build_export_tree
    TreeBuilderReportExport.new('export_tree', 'export', @sb)
  end

  def determine_root_node_info
    case x_active_tree
    when :db_tree
      db_get_node_info
    when :export_tree
      @export = true
      get_export_reports unless x_node == "root"
      @right_cell_text ||= _("Import / Export")
      @help_topic        = request.parameters["controller"] + "-import_export"
    when :roles_tree
      menu_get_all
      @changed = session[:changed] = false
      @help_topic = request.parameters["controller"] + "-menus_editor"
    when :reports_tree
      @right_cell_text ||= _("All Reports")
    when :savedreports_tree
      get_all_saved_reports
    when :schedules_tree
      @schedule = nil
      schedule_get_all
      @help_topic = request.parameters["controller"] + "-schedules_list"
    when :widgets_tree
      widget_get_node_info
    end
  end

  def determine_g_node_info(nodeid)
    if x_active_tree == :roles_tree
      @sb[:menu_buttons] = true
      get_menu(nodeid) if nodeid.present?
    else
      db_get_node_info
    end
  end

  def determine_xx_node_info
    case x_active_tree
    when :savedreports_tree then saved_reports_get_node_info
    when :db_tree           then db_get_node_info
    when :reports_tree      then reports_get_node_info
    when :widgets_tree      then widget_get_node_info
    when :export_tree       then export_get_node_info
    end
  end

  def determine_rr_node_info
    nodes = x_node.split('-')
    show_saved_report
    @record = MiqReportResult.for_user(current_user).find(nodes.last)
    @right_cell_text = _("Saved Report \"%{name} - %{timestamp}\"") % {
      :name      => @record.name,
      :timestamp => format_timezone(@record.created_on, Time.zone, "gt")
    }
    @right_cell_div  = "savedreports_list"
  end

  def export_get_node_info
    @right_cell_text = _("Import / Export")
    if x_node.split('-').last == "exportcustomreports"
      get_export_reports
      @right_cell_div = "export_custom_reports"
    else
      @in_a_form = true
      @widget_exports = MiqWidget.all.reject(&:read_only).collect { |widget| [widget.title, widget.id] }
      @right_cell_div = "export_widgets"
    end
  end

  def saved_reports_get_node_info
    nodes = x_node.split('-')
    get_all_reps(nodes[1])
    miq_report = MiqReport.for_user(current_user).find(@sb[:miq_report_id])
    @sb[:sel_saved_rep_id] = nodes.last
    @right_cell_div = "savedreports_list"
    @right_cell_text = _("Saved Report \"%{name}\"") % {:name => miq_report.name}
  end

  def reports_get_node_info
    nodes = x_node.split('-')

    if nodes.length == 2
      @right_cell_text ||= _("%{typ} Reports") % {:typ => @sb[:rpt_menu][nodes[1].to_i][0]}

    elsif nodes.length == 4 && @sb[:rpt_menu][nodes[1].to_i].present?
      @sb[:rep_details] = {}

      @sb[:rpt_menu][nodes[1].to_i][1][nodes[3].to_i][1].each_with_index do |rep, _|
        r = MiqReport.find_by(:name => rep)
        next unless r

        @sb[:rep_details][r.name] = {
          'display_filters' => !!r.display_filter,
          'filters'         => !!r.conditions,
          'charts'          => !!r.graph,
          'sortby'          => !!r.sortby,
          'id'              => r.id,
          'user'            => r.user ? r.user.userid : '',
          'group'           => r.miq_group ? r.miq_group.description : '',
        }
      end

      @right_cell_text ||= _("%{typ} Reports") % {:typ => @sb[:rpt_menu][nodes[1].to_i][1][nodes[3].to_i][0]}

    elsif nodes.length == 4 && @sb[:rpt_menu][nodes[1].to_i].nil?
      x_node_set("root", x_active_tree)

    elsif nodes.length == 5
      @sb[:selected_rep_id] = nodes[4]
      if role_allows?(:feature => "miq_report_widget_editor")
        # all widgets for this report
        get_all_widgets("report", nodes[4])
      end
      get_all_reps(nodes[4])

    elsif nodes.length == 6
      @sb[:last_saved_id] = x_node
      @sb[:miq_report_id] = nil
      show_saved
    end

    @right_cell_div ||= "report_list"
    @right_cell_text ||= _("All Reports")
  end

  # Get all info for the node about to be displayed
  def get_node_info(_node = {}, _show_list = true)
    treenodeid = valid_active_node(x_node)
    if %i[db_tree reports_tree saved_tree savedreports_tree widgets_tree].include?(x_active_tree)
      @nodetype = case x_active_tree
                  when :savedreports_tree
                    parse_nodetype_and_id(treenodeid)[0]
                  else
                    treenodeid.split('-')[0]
                  end
      self.x_active_tree = :savedreports_tree if @nodetype == "saved"
      nodeid            = treenodeid.split("-")[1] if treenodeid.split("-")[1]
    else
      @nodetype, nodeid = treenodeid.split("-")
    end
    @sb[:menu_buttons] = false

    case @nodetype
    when "root" then determine_root_node_info
    when "g"    then determine_g_node_info(nodeid)
    when "xx"   then determine_xx_node_info
    when "rr"   then determine_rr_node_info
    when "msc"  then determine_msc_node_info(nodeid)
    end

    x_history_add_item(:id => treenodeid, :text => @right_cell_text)
    {:view => @view, :pages => @pages}
  end

  def determine_msc_node_info(nodeid)
    return if nodeid.blank?
    get_schedule(nodeid)
    @sb[:selected_sched_id] = nodeid
  end

  def get_export_reports
    @changed = session[:changed] = true
    @in_a_form = true
    @export_reports = {}
    user = current_user
    MiqReport.all.each do |rep|
      if rep.rpt_type == "Custom" && (user.report_admin_user? || (rep.miq_group && rep.miq_group.id == user.current_group.id))
        @export_reports[rep.name] = rep.id
      end
    end
  end

  def set_form_locals
    locals = {}
    if x_active_tree == :export_tree
      locals[:no_reset] = locals[:no_cancel] = locals[:multi_record] = true
      if x_node == "xx-exportwidgets"
        action_url = nil
        record_id = nil
        locals[:export_button] = false
      else
        action_url = "download_report"
        locals[:export_button] = true
      end
    elsif x_active_tree == :schedules_tree || params[:pressed] == "miq_report_schedule_add"
      action_url = "schedule_edit"
      record_id = @edit[:sched_id] ? @edit[:sched_id] : nil
    elsif x_active_tree == :widgets_tree
      action_url = "widget_edit"
      record_id = @edit[:widget_id] ? @edit[:widget_id] : nil
    elsif x_active_tree == :db_tree
      if @edit[:new][:dashboard_order]
        action_url = "db_seq_edit"
        locals[:multi_record] = true
      else
        action_url = "db_edit"
        record_id = @edit[:db_id] ? @edit[:db_id] : nil
      end
    elsif x_active_tree == :reports_tree
      action_url = "miq_report_edit"
      record_id = @edit[:rpt_id] ? @edit[:rpt_id] : nil
    elsif x_active_tree == :roles_tree
      action_url = "menu_update"
      locals[:default_button] = true
      record_id = @edit[:user_group]
    end
    locals[:action_url] = action_url
    locals[:record_id] = record_id
    locals
  end

  def set_partial_name
    case x_active_tree
    when :db_tree           then 'db_list'
    when :export_tree       then 'export'
    when :reports_tree      then params[:pressed] == 'miq_report_schedule_add' ? 'schedule_list' : 'report_list'
    when :roles_tree        then 'role_list'
    when :savedreports_tree then 'savedreports_list'
    when :schedules_tree    then 'schedule_list'
    when :widgets_tree      then 'widget_list'
    else                         'role_list'
    end
  end

  # Check for parent nodes missing from vandt tree and return them if any
  def open_parent_nodes
    existing_node = nil
    nodes = params[:id].split('_')
    nodes.pop
    parents = []
    nodes.each do |node|
      parents.push(:id => node.split('xx-').last)
    end

    # Go up thru the parents and find the highest level unopened, mark all as opened along the way
    unless parents.empty? || # Skip if no parents or parent already open
           x_tree[:open_nodes].include?(x_build_node_id(parents.last))
      parents.reverse_each do |p|
        p_node = x_build_node_id(p)
        # some of the folder nodes are not autoloaded
        # that's why they already exist in open_nodes
        x_tree[:open_nodes].push(p_node) unless x_tree[:open_nodes].include?(p_node)
        existing_node = p_node
      end
    end

    add_nodes = {:key => existing_node, :nodes => tree_add_child_nodes(existing_node)} if existing_node
    self.x_node = params[:id]
    add_nodes
  end

  # :replace_trees key can be an array of tree symbols to be replaced
  def replace_right_cell(options = {})
    @explorer = true

    replace_trees = options[:replace_trees] || []
    get_node_info unless @in_a_form
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    # nodetype is special for menu editor, so set it to :menu_edit_action if passed in, else use x_node prefix
    nodetype = options[:menu_edit_action] ? options[:menu_edit_action] : x_node.split('-').first

    @sb[:active_tab] = params[:tab_id] ? params[:tab_id] : "report_info" if x_active_tree == :reports_tree &&
                                                                            params[:action] != "reload" && !%w[miq_report_run saved_report_delete].include?(params[:pressed]) # do not reset if reload saved reports buttons is pressed

    rebuild = @in_a_form ? false : rebuild_trees
    valid_trees = %i[reports schedules savedreports db widgets].find_all do |tree|
      tree_exists?(tree.to_s + "_tree")
    end
    trees = build_replaced_trees(rebuild ? valid_trees : replace_trees, valid_trees)

    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    # Clicked on right cell record, open the tree enough to show the node, if not already showing
    # Open the parent nodes of selected record, if not open
    # Showing a report
    if (params[:action] == "get_report" && x_active_tree == :savedreports_tree && @record) ||
       params[:action] == 'x_show'
      presenter[:add_nodes] = open_parent_nodes # Open the parent nodes of selected record, if not open
    end
    presenter[:open_accord] = params[:accord] if params[:accord] # Open new accordion

    locals = set_form_locals if @in_a_form
    partial = options[:partial] ? options[:partial] : set_partial_name
    unless @in_a_form
      c_tb = build_toolbar(center_toolbar_filename)
      h_tb = build_toolbar("x_history_tb") unless x_active_tree == :export_tree
      v_tb = build_toolbar("report_view_tb") if @report && %i[reports_tree savedreports_tree].include?(x_active_tree)
    end

    reload_trees_by_presenter(presenter, trees)
    presenter[:osf_node] = x_node # Open, select, and focus on this node

    session[:changed] = (@edit[:new] != @edit[:current]) if @edit && @edit[:current] # to get save/reset buttons to highlight when something is changed

    if nodetype == 'root' || (nodetype != 'root' && x_active_tree != :roles_tree)
      presenter.update(:main_div, r[:partial => partial])
      case x_active_tree
      when :db_tree
        if @in_a_form
          @right_cell_text = if @edit[:new][:dashboard_order]
                               _("Editing Dashboard sequence for \"%{name}\"") % {:name => @sb[:group_desc]}
                             else
                               @dashboard.id ? _("Editing Dashboard \"%{name}\"") % {:name => @dashboard.name} : _("Adding a new dashboard")
                             end
          # URL to be used in miqDropComplete method
          presenter[:miq_widget_dd_url] = "report/db_widget_dd_done"
          presenter[:init_dashboard] = true
        end
      when :export_tree
        @right_cell_text = _("Import / Export")
      when :reports_tree
        if params[:pressed] == "miq_report_schedule_add"
          if @in_a_form
            presenter[:build_calendar] = true
            @right_cell_text = @schedule.id ? _("Editing Schedule \"%{name}\"") % {:name => @schedule.name} : _("Adding a new Schedule")
          end
        elsif @in_a_form
          @right_cell_text = if @rpt.id
                               _("Editing Report \"%{name}\"") % {:name => @rpt.name}
                             else
                               _("Adding a new Report")
                             end
        end
      when :schedules_tree
        if @in_a_form
          presenter[:build_calendar] = true
          @right_cell_text = @schedule.id ? _("Editing Schedule \"%{name}\"") % {:name => @schedule.name} : _("Adding a new Schedule")
        end
      when :widgets_tree
        if @in_a_form
          presenter[:build_calendar] = {
            :date_from => Time.now.in_time_zone(@edit[:tz]),
            :date_to   => nil,
          }
          # URL to be used in miqDropComplete method
          if @sb[:wtype] == 'm'
            presenter[:miq_widget_dd_url] = 'report/widget_shortcut_dd_done'
            presenter[:init_dashboard] = true
          end
          @right_cell_text = @widget.id ? _("Editing Widget \"%{title}\"") % {:title => @widget.title} : _("Adding a new Widget")
        end
      end
    elsif nodetype == "g"
      # group in menu editor is selected
      if @sb[:node_clicked]
        # folder selected to edit in menu tree
        val = session[:node_selected].split('__')[0]
        if val == "b"
          fieldset_title    = _("Manage Accordions")
          img_title_top     = _("Move selected Accordion to top")
          img_title_up      = _("Move selected Accordion up")
          img_title_down    = _("Move selected Accordion down")
          img_title_add     = _("Add folder to selected Accordion")
          img_title_delete  = _("Delete selected Accordion and its contents")
          img_title_bottom  = _("Move selected Accordion to bottom")
          img_title_commit  = _("Commit Accordion management changes")
          img_title_discard = _("Discard Accordion management changes")
        else
          fieldset_title    = _("Manage Folders in %{location}") % {:location => "\"#{session[:node_selected].split('__')[1]}\""}
          img_title_top     = _("Move selected folder to top")
          img_title_up      = _("Move selected folder up")
          img_title_down    = _("Move selected folder down")
          img_title_add     = _("Add subfolder to selected folder")
          img_title_delete  = _("Delete selected folder and its contents")
          img_title_bottom  = _("Move selected folder to bottom")
          img_title_commit  = _("Commit folder management changes")
          img_title_discard = _("Discard folder management changes")
        end
        presenter.update(:main_div, r[:partial => partial])
        presenter[:element_updates][:menu1_legend] = {:legend => fieldset_title}
        presenter.show(:menu_div1).hide(:menu_div2, :flash_msg_div)
        presenter[:element_updates][:menu_roles_treebox] = {:class => 'disabled', :add => true}
        presenter[:element_updates][:folder_top]      = {:title => img_title_top}
        presenter[:element_updates][:folder_up]       = {:title => img_title_up}
        presenter[:element_updates][:folder_down]     = {:title => img_title_down}
        presenter[:element_updates][:folder_add]      = {:title => img_title_add}
        presenter[:element_updates][:folder_delete]   = {:title => img_title_delete}
        presenter[:element_updates][:folder_bottom]   = {:title => img_title_bottom}
        presenter[:element_updates][:folder_commit]   = {:title => img_title_commit}
        presenter[:element_updates][:folder_discard]  = {:title => img_title_discard}
      else
        presenter.update(:main_div, r[:partial => partial])
        presenter[:clear_tree_cookies] = "edit_treeOpenStatex"
        unless @sb[:role_list_flag]
          # we dont need to show the overlay on first time load
          @sb[:role_list_flag] = true
          presenter[:element_updates][:menu_roles_treebox] = {:class => 'disabled', :add => true}
        end
        presenter.hide(:menu_div1, :menu_div2).show(:menu_div3)
      end
    elsif %w[menu_default menu_reset].include?(nodetype)
      presenter.update(:main_div, r[:partial => partial])
      presenter.replace(:menu_div1, r[:partial => "menu_form1", :locals => {:folders => @grid_folders}])
      presenter.hide(:menu_div1, :menu_div2).show(:menu_div3)
      presenter[:element_updates][:menu_roles_treebox] = {:class => 'disabled', :remove => true}

      # set changed to true if menu has been set to default
      session[:changed] = @sb[:menu_default] ? true : (@edit[:new] != @edit[:current])
    elsif nodetype == "menu_edit_reports"
      presenter.replace(:flash_msg_div, r[:partial => "layouts/flash_msg"]) if @flash_array
      presenter.show(:menu_div1)
      presenter[:element_updates][:menu_roles_treebox] = {:class => 'disabled', :add => true}
      presenter.replace(:menu_div2, r[:partial => "menu_form2"])
      presenter.hide(:menu_div1, :menu_div3).show(:menu_div2)
    elsif nodetype == "menu_commit_reports"
      presenter.replace(:flash_msg_div, r[:partial => "layouts/flash_msg"]) if @flash_array
      if @refresh_div
        presenter.hide(:flash_msg_div)
        presenter.replace(@refresh_div.to_s, r[:partial => @refresh_partial, :locals => {:action_url => "menu_update"}])
        presenter.hide(:menu_div1)
        if params[:pressed] == "commit"
          presenter.show(:menu_div3).hide(:menu_div2)
        else
          presenter.hide(:menu_div3).show(:menu_div2)
        end
      elsif !@flash_array
        presenter.replace(:menu_roles_div, r[:partial => "role_list"])
        if params[:pressed] == "commit"
          presenter.hide(:flash_msg_div).show(:menu_div3).hide(:menu_div1, :menu_div2)
        else
          presenter.hide(:menu_div1, :menu_div3).show(:menu_div2)
        end
        presenter[:element_updates][:menu_roles_treebox] = {:class => 'disabled', :remove => true}
      end
    elsif nodetype == 'menu_commit_folders'
      # Hide flash_msg if it's being shown from New folder add event
      if flash_errors?
        presenter.replace(:flash_msg_div, r[:partial => 'layouts/flash_msg'])
      else
        presenter.hide(:flash_msg_div)
      end

      if @sb[:tree_err]
        presenter.show(:menu_div1).hide(:menu_div2, :menu_div3)
      else
        presenter.replace(:menu_roles_div, r[:partial => "role_list"])
        presenter.hide(:menu_div1, :menu_div2).show(:menu_div3)
        presenter[:element_updates][:menu_roles_treebox] = {:class => 'disabled', :remove => true}
      end
      @sb[:tree_err] = false
    elsif %w[menu_discard_folders menu_discard_reports].include?(nodetype)
      presenter.replace(:flash_msg_div, r[:partial => 'layouts/flash_msg'])
      presenter.replace(:menu_div1, r[:partial => 'menu_form1', :locals => {:folders => @grid_folders}])
      presenter.hide(:menu_div1, :menu_div2).show(:menu_div3)
      presenter[:element_updates][:menu_roles_treebox] = {:class => 'disabled', :remove => true}
    end

    if x_active_tree == :roles_tree && x_node != "root"
      @right_cell_text = _("Editing EVM Group \"%{name}\"") % {:name => session[:role_choice]}
    end
    presenter[:right_cell_text] = @right_cell_text

    # Handle bottom cell
    if (@in_a_form || @pages) || (@sb[:pages] && @html)
      if @pages
        presenter.hide(:form_buttons_div, :rpb_div_1)
      elsif @in_a_form
        presenter.update(:form_buttons_div, r[:partial => 'layouts/x_edit_buttons', :locals => locals])
        presenter.remove_paging.hide(:rpb_div_1).show(:form_buttons_div)
      elsif @sb[:pages]
        presenter.update(:paging_div, r[:partial => 'layouts/saved_report_paging_bar', :locals => @sb[:pages]])
        presenter.hide(:form_buttons_div).show(:rpb_div_1).remove_paging
      end
      presenter.show(:paging_div)
    else
      presenter.hide(:form_buttons_div)
      presenter.hide(:paging_div)
    end
    if (@sb[:active_tab] == 'report_info' && x_node.split('-').length == 5 && !@in_a_form) || %w[xx-exportwidgets xx-exportcustomreports].include?(x_node)
      presenter.hide(:paging_div)
    end
    presenter.set_visibility(!@in_a_form, :toolbar)

    presenter.reload_toolbars(:history => h_tb, :center => c_tb, :view => v_tb)

    presenter[:record_id] = (locals && locals[:record_id]) || determine_record_id_for_presenter

    # Lock current tree if in edit or assign, else unlock all trees
    presenter[:lock_sidebar] = @edit && @edit[:current]

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs_new'])

    render :json => presenter.for_render
  end

  def get_session_data
    super
    @report_tab       = session[:report_tab]
    @report_result_id = session[:report_result_id]
    @menu             = session[:report_menu]
    @folders          = session[:report_folders]
    @ght_type         = session[:ght_type] || "tabular"
    @report_groups    = session[:report_groups]
    @edit             = session[:edit] unless session[:edit].nil?
    @catinfo          = session[:vm_catinfo]
    @grid_folders     = session[:report_grid_folders]
  end

  def set_session_data
    super
    session[:report_tab]        = @report_tab
    session[:panels]            = @panels
    session[:ght_type]          = @ght_type
    session[:report_groups]     = @report_groups
    session[:vm_catinfo]        = @catinfo
    session[:report_result_id]  = @report_result_id
    session[:report_menu]       = @menu
    session[:report_folders]    = @folders
    session[:report_grid_folders] = @grid_folders
  end

  def widget_import_service
    @widget_import_service ||= WidgetImportService.new
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Cloud Intel")},
        {:title => _("Reports")},
      ],
    }
  end

  menu_section :vi
end

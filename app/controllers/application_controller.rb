# rubocop:disable Lint/EmptyWhen
require 'open-uri'

class ApplicationController < ActionController::Base
  include Vmdb::Logging

  if Vmdb::Application.config.action_controller.allow_forgery_protection
    # Add CSRF protection for this controller, which enables the
    # verify_authenticity_token before_action, with a random secret.
    # This secret is reset to a value found in the miq_databases table in
    # MiqWebServerWorkerMixin.configure_secret_token for rails server, UI, and
    # web service worker processes.
    protect_from_forgery(:secret => SecureRandom.hex(64),
                         :except => %i[authenticate external_authenticate kerberos_authenticate saml_login initiate_saml_login oidc_login initiate_oidc_login csp_report],
                         :with   => :reset_session)

  end

  helper GtlHelper
  helper ChartingHelper
  ManageIQ::Reporting::Charting.load_helpers(self)

  include ActionView::Helpers::NumberHelper # bring in the number helpers for number_to_human_size
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::DateHelper
  include ApplicationHelper
  include Mixins::TimeHelper
  include Mixins::MenuSection
  include Mixins::GenericToolbarMixin
  include Mixins::RbacFeaturePairingMixin
  include Mixins::ControllerConstants
  include Mixins::CustomButtons
  include Mixins::CheckedIdMixin
  include ParamsHelper
  include ApplicationHelper::Toolbar::Mixins::CustomButtonToolbarMixin
  include QuadiconHelper

  helper ToolbarHelper
  helper JsHelper
  helper QuadiconHelper
  helper ViewFormattingHelper

  helper CloudResourceQuotaHelper

  # Expose constants as a helper method in views
  helper do
    def pp_choices
      PPCHOICES
    end

    def pp_options
      PPOPTIONS
    end
  end

  include_concern 'AdvancedSearch'
  include_concern 'Automate'
  include_concern 'Buttons'
  include_concern 'CiProcessing'
  include_concern 'Compare'
  include_concern 'CurrentUser'
  include_concern 'DialogRunner'
  include_concern 'Explorer'
  include_concern 'Filter'
  include_concern 'MiqRequestMethods'
  include_concern 'Performance'
  include_concern 'PolicySupport'
  include_concern 'ReportDownloads'
  include_concern 'SessionSize'
  include_concern 'SysprepAnswerFile'
  include_concern 'UserScriptFile'
  include_concern 'Tags'
  include_concern 'Tenancy'
  include_concern 'Timelines'
  include_concern 'Timezone'
  include_concern 'TreeSupport'
  include_concern 'WaitForTask'

  before_action :reset_toolbar
  before_action :set_session_tenant
  before_action :get_global_session_data, :except => %i[resize_layout authenticate]
  before_action :set_user_time_zone
  before_action :set_gettext_locale
  before_action :allow_websocket
  after_action :set_global_session_data, :except => %i[csp_report resize_layout]

  TIMELINES_FOLDER = Rails.root.join("product", "timelines")

  ONE_MILLION = 1_000_000 # Setting high number incase we don't want to display paging controls on list views

  PERPAGE_TYPES = %w[list reports].each_with_object({}) { |value, acc| acc[value] = value.to_sym }.freeze

  TREND_MODEL = "VimPerformanceTrend".freeze # Performance trend model name requiring special processing

  # Default UI settings
  DEFAULT_SETTINGS = {
    :views    => { # List view setting, by resource type
      :compare      => "expanded",
      :compare_mode => "details",
      :drift        => "expanded",
      :drift_mode   => "details",
      :summary_mode => "dashboard",
      :vmcompare    => "compressed"
    },
    :perpage  => { # Items per page, by view setting
      :list    => 20,
      :reports => 20
    },
    :display  => {
      :startpage     => "/dashboard/show",
      :reporttheme   => "MIQ",
      :theme         => "red",            # Luminescent Blue
      :taskbartext   => true,             # Show button text on taskbar
      :vmcompare     => "Compressed",     # Start VM compare and drift in compressed mode
      :hostcompare   => "Compressed",     # Start Host compare in compressed mode
      :timezone      => nil               # This will be set when the user logs in
    },
  }.freeze

  AE_MAX_RESOLUTION_FIELDS = 5 # Maximum fields to show for automation engine resolution screens

  # **************************************************************************************************
  # NOTE, this is the default error handler.                                                         *
  # Any unrescued exception will unwind the stack until it reaches the default error handler here.   *
  # See the error_handler method to see how we try to generically rescue exceptions.                 *
  # **************************************************************************************************
  rescue_from StandardError, :with => :error_handler

  def local_request?
    Rails.env.development? || Rails.env.test?
  end

  def allow_websocket
    override_content_security_policy_directives(:connect_src => ["'self'", 'https://fonts.gstatic.com', websocket_origin])
  end
  private :allow_websocket

  def reset_toolbar
    @toolbars = {}
  end

  # Convert Controller Name to Actual Model
  def self.model
    @model ||= name[0..-11].safe_constantize
  rescue StandardError
    @model = nil
  end

  def self.permission_prefix
    controller_name
  end

  def self.table_name
    @table_name ||= model.name.underscore
  end

  def table_name
    self.class.table_name
  end

  def self.session_key_prefix
    table_name
  end

  def self.handle_exceptions?
    Thread.current[:application_controller_handles_exceptions] != false
  end

  def self.handle_exceptions=(v)
    Thread.current[:application_controller_handles_exceptions] = v
  end

  def error_handler(e)
    raise e unless ApplicationController.handle_exceptions?

    logger.fatal("Error caught: [#{e.class.name}] #{e.message}\n#{e.backtrace.join("\n")}")

    msg = case e
          when ::ActionController::RoutingError
            _("Action not implemented")
          when ::AbstractController::ActionNotFound # Prevent Rails showing all known controller actions
            _("Unknown Action")
          when ::MiqException::RbacPrivilegeException
            _("The user is not authorized for this task or item")
          else
            e.message
          end

    render_exception(msg, e)
  end
  private :error_handler

  def render_exception(msg, error)
    respond_to do |format|
      format.js do
        render :update do |page|
          page << javascript_prologue

          message = msg + " [#{params[:controller]}/#{params[:action]}]"

          page << "
            sendDataWithRx({
              serverError: {
                data: '#{j_str message}',
                url: '#{j_str request.url}',
              },
              source: 'server',
            });

            miqSparkle(false);
          "

          page << javascript_hide_if_exists("adv_searchbox_div")
        end
      end
      format.html do # HTML, send error screen
        case error
        when ::MiqException::RbacPrivilegeException
          redirect_to(:controller => 'dashboard', :action => "auth_error")
        else
          @layout = "exception"
          response.status = 500
          render(:template => "layouts/exception", :locals => {:message => msg})
        end
      end
      format.any { head :not_found } # Anything else, just send 404
    end
  end
  private :render_exception

  def change_tab
    redirect_to(:action => params[:tab], :id => params[:id])
  end

  def download_summary_pdf(klass = self.class.model)
    # do not build quadicon links
    @embedded = true
    @showlinks = false

    @record = identify_record(params[:id], klass)
    yield if block_given?
    return if record_no_longer_exists?(@record)

    get_tagdata(@record) if @record.try(:taggings)
    @display = "download_pdf"
    set_summary_pdf_data
  end

  def build_targets_hash(items)
    @targets_hash ||= {}
    # if array of objects came in
    items.each do |item|
      @targets_hash[item.id.to_i] = item
    end
  end

  # Send chart data to the client
  def render_chart
    assert_privileges("view_graph")

    if params[:report]
      rpt = MiqReport.for_user(current_user).find_by(:name => params[:report])
      rpt.generate_table(:userid => session[:userid])
    else
      rpt = if session[:report_result_id]
              MiqReportResult.for_user(current_user).find(session[:report_result_id]).report_results
            elsif session[:rpt_task_id].present?
              MiqTask.find(session[:rpt_task_id]).task_results
            else
              @report
            end
    end

    rpt.to_chart(settings(:display, :reporttheme), true, MiqReport.graph_options)
    rpt.chart
  end
  helper_method :render_chart
  # Private method for processing params.
  # params can contain these options:
  # @param params parameters object.
  # @option params :explorer [String]
  #     String value of boolean if we are fetching data for explorer or not. "true" | "false"
  # @option params :active_tree [String]
  #     String value of active tree node.
  # @option params :model_id [String]
  #     String value of model's ID to be filtered with.
  def process_params_options(params)
    restore_quadicon_options(params[:additional_options] || {})
    options = from_additional_options(params[:additional_options] || {})
    if params[:explorer]
      params[:action] = "explorer"
      @explorer = params[:explorer].to_s == "true"
    end

    if params[:parent_id]
      parent_id = params[:parent_id]
      unless parent_id.nil?
        options[:parent] = identify_record(parent_id, controller_to_model) if parent_id && options[:parent].nil?
      end
    end

    options[:parent] = options[:parent] || @parent
    options[:association] = HAS_ASSOCATION[params[:model_name]] if HAS_ASSOCATION.include?(params[:model_name])
    options[:selected_ids] = params[:records]
    options
  end
  private :process_params_options

  # Method for processing params and finding correct model for current params.
  # @param params parameters object.
  # @option params :active_tree [String]
  #     String value of active tree node.
  # @option params :model [String]
  #     String value of model to be selected.
  # @param options options Object.
  # @option options :model [Object]
  #     If model was chosen somehow before calling this method use this model instead of finding it.
  def process_params_model_view(params, options)
    model_view   = options[:model_name].constantize if options[:model_name]
    model_view ||= model_string_to_constant(params[:model_name]) if params[:model_name]
    model_view ||= model_from_active_tree(params[:active_tree].to_sym) if params[:active_tree]
    model_view ||  controller_to_model
  end
  private :process_params_model_view

  def set_variables_report_data(settings, current_view)
    settings[:sort_dir] = @sortdir unless settings.nil?
    settings[:sort_col] = @sortcol unless settings.nil?
    @edit = session[:edit]
    @policy_sim = @edit[:policy_sim] unless @edit.nil?
    controller, _action = db_to_controller(current_view.db) unless current_view.nil?
    if !@policy_sim.nil? && session[:policies] && !session[:policies].empty?
      settings[:url] = '/' + controller + '/policies/'
    end
    settings
  end
  private :set_variables_report_data

  def allowed_tenant_names
    current_tenant = User.current_user.current_tenant
    (current_tenant.descendants + [current_tenant]).map(&:name)
  end
  private :allowed_tenant_names

  # Exception: Model Tenant and named_scope :in_my_region need to filter out the parent name if current user has no access to it.
  # This can be removed once this is somehow fixed on the backend.
  def filter_parent_name_tenant(table)
    table.data.map! do |x|
      x['parent_name'] = '' unless allowed_tenant_names.include?(x['parent_name'])
      x
    end
    table
  end
  private :filter_parent_name_tenant

  # Method for fetching report data. These data can be displayed in Grid/Tile/List.
  # This method will first process params for options and then for current model.
  # From these options and model we get view (for fetching data) and settings (will hold info about paging).
  # Then this method will return JSON object with settings and data.
  def report_data
    options = process_params_options(params)
    if options.nil? || options[:view].nil?
      model_view = process_params_model_view(params, options)
      @edit = session[:edit]
      @view, settings = get_view(model_view, options, true)
    else
      @view = options[:view]
      settings = options[:pages]
    end
    settings = set_variables_report_data(settings, @view)

    if options && options[:named_scope] == "in_my_region" && options[:model] == "Tenant"
      @view.table = filter_parent_name_tenant(@view.table)
    end

    render :json => {
      :checkboxes_clicked => params.fetch_path(:additional_options, :checkboxes_clicked),
      :settings => settings,
      :data     => view_to_hash(@view, true),
      :messages => @flash_array
    }
  end

  def event_logs
    @record = identify_record(params[:id])
    @view = session[:view] # Restore the view from the session to get column names for the display
    return if record_no_longer_exists?(@record)

    @lastaction = "event_logs"
    obj = @record.kind_of?(Vm) ? "vm" : "host"
    bc_text = @record.kind_of?(Vm) ? _("Event Logs") : _("ESX Logs")
    @sb[:action] = params[:action]
    @explorer = true if @record.kind_of?(VmOrTemplate)
    params[:display] = "event_logs"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] || params[:x_show]
      @item = @record.event_logs.find(id)
      drop_breadcrumb(:name => @record.name + " (#{bc_text})", :url => "/#{obj}/event_logs/#{@record.id}?page=#{@current_page}")
      drop_breadcrumb(:name => @item.name, :url => "/#{obj}/show/#{@record.id}?show=#{@item.id}")
      show_item
    else
      drop_breadcrumb(:name => @record.name + " (#{bc_text})", :url => "/#{obj}/event_logs/#{@record.id}")
      show_details(EventLog, :association => "event_logs")
    end
  end

  # Common method to show a standalone report
  def report_only
    assert_privileges("report_only")

    # Render error message if report doesn't exist
    if params[:rr_id].nil? && @sb.fetch_path(:pages, :rr_id).nil?
      add_flash(_("This report isn't generated yet. It cannot be rendered."), :error)
      render :partial => "layouts/flash_msg"
      return
    end
    # Dashboard widget will send in report result id else, find report result in the sandbox
    search_id = params[:rr_id] ? params[:rr_id].to_i : @sb[:pages][:rr_id]
    rr = MiqReportResult.for_user(current_user).find(search_id)

    session[:report_result_id] = rr.id  # Save report result id for chart rendering
    session[:rpt_task_id]      = nil    # Clear out report task id, using a saved report

    @report = rr.report
    @report_result_id = rr.id # Passed in app/views/layouts/_report_html to the ReportDataTable
    @report_title = rr.friendly_title
    @html = report_build_html_table(rr.report_results, rr.html_rows.join)
    @ght_type = params[:type] || (@report.graph.blank? ? 'tabular' : 'hybrid')
    @render_chart = (@ght_type == 'hybrid')
    # Indicate stand alone report for views
    render 'shared/show_report', :layout => 'report_only'
  end

  # moved this method here so it can be accessed from pxe_server controller as well
  # this is a terrible name, it doesn't validate log_depots
  def log_depot_validate
    @schedule = nil # setting to nil, since we are using same view for both db_back and log_depot edit
    # if zone is selected in tree replace tab#3
    pfx = if x_active_tree == :diagnostics_tree
            if @sb[:active_tab] == "diagnostics_database"
              # coming from diagnostics/database tab
              "dbbackup"
            end
          elsif session[:edit]&.key?(:pxe_id)
            # add/edit pxe server
            "pxe"
          else
            # add/edit dbbackup schedule
            "schedule"
          end

    id = params[:id] || "new"
    if pfx == "pxe"
      return unless load_edit("#{pfx}_edit__#{id}")

      settings = {:username => @edit[:new][:log_userid], :password => @edit[:new][:log_password]}
      settings[:uri] = @edit[:new][:uri_prefix] + "://" + @edit[:new][:uri]
    else
      settings = {:username => params[:log_userid], :password => params[:log_password]}
      settings[:uri] = "#{params[:uri_prefix]}://#{params[:uri]}"
      settings[:uri_prefix] = params[:uri_prefix]
    end

    begin
      if pfx == "pxe"
        msg = _('PXE Credentials successfuly validated')
        PxeServer.verify_depot_settings(settings)
      else
        msg = _('Depot Settings successfuly validated')
        MiqSchedule.new.verify_file_depot(settings)
      end
    rescue StandardError => bang
      add_flash(_("Error during 'Validate': %{error_message}") % {:error_message => bang.message}, :error)
    else
      add_flash(msg)
    end

    @changed = (@edit[:new] != @edit[:current]) if pfx == "pxe"
    javascript_flash
  end

  # to reload currently displayed summary screen in explorer
  def reload
    @_params[:id] = x_node
    @report_deleted = true if params[:deleted].present?
    tree_select
  end

  def filesystem_download
    fs = identify_record(params[:id], Filesystem)
    send_data(fs.contents, :filename => fs.name)
  end

  # Clear the Search and display original list of items
  def search_clear
    @search_text = @sb[:search_text] = nil
    params[:miq_grid_checks] = []
    if params[:in_explorer] == "true"
      reload
    else # non-explorer screens
      javascript_redirect(last_screen_url)
    end
  end

  protected

  def render_flash(add_flash_text = nil, severity = nil)
    javascript_flash(:text => add_flash_text, :severity => severity)
  end

  def tagging_explorer_controller?
    false
  end

  private

  def move_cols_left_right(direction)
    flds = direction == "right" ? "available_fields" : "selected_fields"
    edit_fields = direction == "right" ? "available_fields" : "fields"
    sort_fields = direction == "right" ? "fields" : "available_fields"
    if params[flds.to_sym].blank? || params[flds.to_sym][0] == ""
      lr_messages = {
        "left"  => _("No fields were selected to move left"),
        "right" => _("No fields were selected to move right")
      }
      add_flash(lr_messages[direction], :error)
    else
      @edit[:new][edit_fields.to_sym].each do |af|           # Go thru all available columns
        next unless params[flds.to_sym].include?(af[1].to_s) # See if this column was selected to move
        next if @edit[:new][sort_fields.to_sym].include?(af) # Only move if it's not there already

        @edit[:new][sort_fields.to_sym].push(af)             # Add it to the new fields list
      end
      # Remove selected fields
      @edit[:new][edit_fields.to_sym].delete_if { |af| params[flds.to_sym].include?(af[1].to_s) }
      @edit[:new][sort_fields.to_sym].sort! # Sort the selected fields array
      @refresh_div = "column_lists"
      @refresh_partial = "column_lists"
    end
  end

  # Disable client side caching of the response being sent
  def disable_client_cache
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = 'no-cache'
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

  # Common method enable/disable schedules
  def schedule_enable_disable(schedules, enabled)
    schedules.reject { |schedule| schedule.enabled == enabled }
             .sort_by { |e| e.name.downcase }.each do |schedule|
      schedule.enabled = enabled
      schedule.save!
    end
  end

  # Build the user_emails hash for edit screens needing the edit_email view
  def build_user_emails_for_edit
    @edit[:user_emails] = {}
    to_email = @edit[:new][:email][:to] || []
    users_in_current_groups = User.with_groups(User.current_user.miq_groups).distinct.sort_by { |u| u.name.downcase }
    users_in_current_groups.each do |u|
      next if u.email.blank?
      next if to_email.include?(u.email)

      @edit[:user_emails][u.email] = "#{u.name} (#{u.email})"
    end
  end

  # Build the first html page for a report results record
  def report_first_page(rr)
    rr.build_html_rows_for_legacy # Create the report result details for legacy reports
    @report = rr.report # Grab the report, not including table

    @sb[:pages] ||= {}
    @sb[:pages][:rr_id] = rr.id
    @sb[:pages][:items] = @report.extras[:total_html_rows]
    @sb[:pages][:perpage] = settings(:perpage, :reports)
    @sb[:pages][:current] = 1
    total = @sb[:pages][:items] / @sb[:pages][:perpage]
    total += 1 if @sb[:pages][:items] % @sb[:pages][:perpage] != 0
    @sb[:pages][:total] = total
    @title = @report.title
    if @report.extras[:total_html_rows].zero?
      add_flash(_("No records found for this report"), :warning)
      html = nil
    else
      html = report_build_html_table(@report,
                                     rr.html_rows(:page     => @sb[:pages][:current],
                                                  :per_page => @sb[:pages][:perpage]).join)
    end
    html
  end

  def calculate_lastaction(lastaction)
    return 'show_list' unless lastaction

    parts = lastaction.split('__')
    if parts.first == "replace_cell"
      parts.last
    else
      params[:id] == 'new' ? 'show_list' : lastaction
    end
  end

  def report_edit_aborted(lastaction)
    flash_to_session(_("Edit aborted!  %{product} does not support the browser's back button or access from multiple tabs or windows of the same browser.  Please close any duplicate sessions before proceeding.") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :error)
    if request.xml_http_request? # Is this an Ajax request?
      if lastaction == "configuration"
        edit
        redirect_to_action = 'index'
      else
        redirect_to_action = lastaction
      end
      js_args = {
        :action        => redirect_to_action,
        :id            => params[:id],
        :escape        => false,
        :load_edit_err => true
      }
      javascript_redirect(javascript_process_redirect_args(js_args))
    else
      redirect_to(:action => lastaction, :id => params[:id], :escape => false)
    end
  end

  def load_edit(key, lastaction = @lastaction)
    lastaction = calculate_lastaction(lastaction)

    if session.fetch_path(:edit, :key) != key
      report_edit_aborted(lastaction)
      return false
    end

    @edit = session[:edit]
    true
  end

  # Put all time profiles for the current user in session[:time_profiles] for pulldowns
  def get_time_profiles(obj = nil)
    session[:time_profiles] = {}
    region_id = obj ? obj.region_id : MiqRegion.my_region_number
    time_profiles = TimeProfile.profiles_for_user(session[:userid], region_id)
    time_profiles.collect { |tp| session[:time_profiles][tp.id] = tp.description }
  end

  def selected_time_profile_for_pull_down
    tp = TimeProfile.profile_for_user_tz(session[:userid], session[:user_tz])
    tp = TimeProfile.default_time_profile if tp.nil?

    if tp.nil? && session[:time_profiles].present?
      first_id_in_hash = Array(session[:time_profiles].invert).min_by(&:first).last
      tp = TimeProfile.find_by(:id => first_id_in_hash)
    end
    tp
  end

  def set_time_profile_vars(tp, options)
    if tp
      options[:time_profile]      = tp.id
      options[:time_profile_tz]   = tp.tz
      options[:time_profile_days] = tp.days
    else
      options[:time_profile]      = nil
      options[:time_profile_tz]   = nil
      options[:time_profile_days] = nil
    end
    options[:tz] = options[:time_profile_tz]
  end

  # if authenticating or past login screen
  def set_user_time_zone
    user = current_user || (params[:user_name].presence && User.find_by(:userid => params[:user_name]))
    session[:user_tz] = Time.zone = (user ? user.get_timezone : server_timezone)
  end

  # Calculate controller name from job.target_class used in the Tasks GTL
  # FIXME: We need to move this, view_to_hash and related code to a separate
  # module.
  #
  def view_to_hash_controller_from_job_target_class(target_class)
    case target_class
    when "ManageIQ::Providers::Openshift::ContainerManager::ContainerImage"
      'container_image'
    else # this branch works e.g. for VmOrTemplate
      target_class.underscore
    end
  end

  # Render the view data to a Hash structure for the list view
  def view_to_hash(view, fetch_data = false)
    root = {:head => [], :rows => []}

    has_checkbox = !@embedded && !@no_checkboxes

    # Show checkbox or placeholder column
    if has_checkbox
      root[:head] << {:is_narrow => true}
    end

    # Icon column, only for list with special icons
    root[:head] << {:is_narrow => true} if ::GtlFormatter::VIEW_WITH_CUSTOM_ICON.include?(view.db)

    view.headers.each_with_index do |h, i|
      col = view.col_order[i]
      next if view.column_is_hidden?(col, self)

      field = MiqExpression::Field.new(view.db_class, [], view.col_order[i])
      align = field.numeric? ? 'right' : 'left'

      root[:head] << {:text    => h,
                      :sort    => 'str',
                      :col_idx => i,
                      :align   => align}
    end

    if @row_button # Show a button as last col
      root[:head] << {:is_narrow => true}
    end

    # Add table elements
    table = view.sub_table || view.table
    view_context.instance_variable_set(:@explorer, @explorer)
    table.data.each do |row|
      target = @targets_hash[row.id] unless row['id'].nil?

      new_row = {
        :id        => list_row_id(row),
        :long_id   => row['id'].to_s,
        :cells     => [],
        :clickable => params.fetch_path(:additional_options, :clickable)
      }

      if defined?(row.data) && defined?(params) && params[:active_tree] != "reports_tree"
        new_row[:parent_id] = "rep-#{row.data['miq_report_id']}" if row.data['miq_report_id']
      end
      new_row[:parent_id] = "xx-#{CONTENT_TYPE_ID[target[:content_type]]}" if target && target[:content_type]
      new_row[:tree_id] = TreeBuilder.build_node_id(target) if target
      if row.data["job.target_class"] && row.data["job.target_id"]
        controller = view_to_hash_controller_from_job_target_class(row.data["job.target_class"])
        new_row[:parent_path] = (url_for_only_path(:controller => controller, :action => "show") rescue nil)
        new_row[:parent_id] = row.data["job.target_id"].to_s if row.data["job.target_id"]
      end
      root[:rows] << new_row

      if has_checkbox
        new_row[:cells] << {:is_checkbox => true}
      end

      options = {
        :clickable  => params.fetch_path(:additional_options, :clickable),
        :row_button => @row_button
      }
      new_row[:cells].concat(::GtlFormatter.format_cols(view, row, self, options))
    end

    root
  end

  def listicon_item(view, id = nil)
    id = @id if id.nil?

    if @targets_hash
      @targets_hash[id] # Get the record from the view
    else
      klass = view.db_class
      klass.find(id)    # Read the record from the db
    end
  end
  public :listicon_item

  def get_host_for_vm(vm)
    @hosts = [vm.host] if vm.host
  end

  # Add a msg to the @flash_array
  def add_flash(msg, level = :success, reset = false)
    @flash_array = [] if reset
    @flash_array ||= []
    @flash_array.push(:message => msg, :level => level)

    case level
    when :error
      $log.error("MIQ(#{controller_name}_controller-#{action_name}): " + msg)
    when :warning, :info
      $log.debug("MIQ(#{controller_name}_controller-#{action_name}): " + msg)
    end
  end

  def flash_errors?
    flash_error_or_warning(:error)
  end
  helper_method(:flash_errors?)

  def flash_warnings?
    flash_error_or_warning(:warning)
  end
  helper_method(:flash_warnings?)

  def flash_error_or_warning(type)
    Array(@flash_array).any? { |f| f[:level] == type }
  end

  # Handle the breadcrumb array by either adding, or resetting to, the passed in breadcrumb
  # if replace = true, only add this bc if it was already there
  def drop_breadcrumb(new_bc, onlyreplace = false)
    # if the breadcrumb is in the array, remove it and all below by counting how many to pop
    return if skip_breadcrumb?

    remove = 0
    @breadcrumbs.each do |bc|
      if remove.positive? # already found a match,
        remove += 1 #   increment pop counter

      # Check for a name match BEFORE the first left paren "(" or a url match BEFORE the last slash "/"
      elsif bc[:name].to_s.gsub(/\(.*/, "").rstrip == new_bc[:name].to_s.gsub(/\(.*/, "").rstrip ||
            bc[:url].to_s.gsub(%r{\/.?$}, "") == new_bc[:url].to_s.gsub(%r{\/.?$}, "")
        remove = 1
      end
    end
    remove.times { @breadcrumbs.pop } # remove found element and any lower elements
    if onlyreplace
      @breadcrumbs.push(new_bc) if remove.positive? # only add it if something was removed
    else
      @breadcrumbs.push(new_bc)
    end
    @breadcrumbs.push(new_bc) if onlyreplace && @breadcrumbs.empty?
    @title = if (@lastaction == "registry_items" || @lastaction == "filesystems" || @lastaction == "files") && new_bc[:name].length > 50
               new_bc [:name].slice(0..50) + "..." # Set the title to be the new breadcrumb
             else
               new_bc [:name] # Set the title to be the new breadcrumb
             end

    # add @search_text to title for gtl screens only
    if @search_text.present? && @display.nil? && !@in_a_form
      @title += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text}
    end
  end

  def handle_invalid_session(timed_out = nil)
    log_privileges(false, "Invalid Session")

    timed_out = PrivilegeCheckerService.new.user_session_timed_out?(session, current_user) if timed_out.nil?
    reset_session

    # remember for after login, but make sure we don't redirect to logout, or POST actions
    session[:start_url] = request.url if request.method == "GET" && !request.url.include?('/logout')

    respond_to do |format|
      format.html do
        redirect_to :controller => 'dashboard', :action => 'login', :timeout => timed_out
      end

      format.json do
        head :unauthorized
      end

      format.js do
        javascript_redirect :controller => 'dashboard', :action => 'login', :timeout => timed_out
      end
    end
  end

  def rbac_free_for_custom_button?(task, button_id)
    task == "custom_button" && CustomButton.find_by(:id => button_id)
  end

  def check_button_rbac
    # buttons ids that share a common feature id
    common_buttons = %w[rbac_project_add rbac_tenant_add]
    task = common_buttons.include?(params[:pressed]) ? rbac_common_feature_for_buttons(params[:pressed]) : rbac_feature_id(params[:pressed])
    # Intentional single = so we can check auth later
    rbac_free_for_custom_button?(task, params[:button_id]) || role_allows?(:feature => task)
  end

  def handle_button_rbac
    pass = check_button_rbac
    unless pass
      add_flash(_("The user is not authorized for this task or item."), :error)
      render_flash
    end
    pass
  end

  def rbac_feature_id(feature_id)
    feature_id
  end

  def check_generic_rbac
    ident = rbac_feature_id("#{controller_name}_#{action_name == 'report_data' ? 'show_list' : action_name}")
    features = Array(self.class.rbac_feature_pairing[action_name.to_sym])

    if MiqProductFeature.feature_exists?(ident)
      role_allows?(:feature => ident, :any => true)
    elsif features.present?
      features.any? { |feature| role_allows?(:feature => feature, :any => true) }
    else
      true
    end
  end

  def handle_generic_rbac(pass)
    unless pass
      if request.xml_http_request?
        javascript_redirect(:controller => 'dashboard', :action => 'auth_error')
      else
        redirect_to(:controller => 'dashboard', :action => 'auth_error')
      end
    end
    pass
  end

  # used as a before_filter for controller actions to check that
  # the currently logged in user has rights to perform the requested action
  def check_privileges
    unless PrivilegeCheckerService.new.valid_session?(session, current_user)
      handle_invalid_session
      return
    end

    if action_name == 'auth_error'
      log_privileges(false, "Authentication Error Redirect")
      return
    end

    pass = %w[button x_button].include?(action_name) ? handle_button_rbac : handle_generic_rbac(check_generic_rbac)
    log_privileges(pass)
  end

  def cleanup_action
    session[:lastaction] = @lastaction if @lastaction
  end

  # get the sort column that was clicked on, else use the current one
  def get_sort_col
    unless params[:sortby].nil?
      @sortdir = if @sortcol == params[:sortby].to_i # if same column was selected
                   flip_sort_direction(@sortdir)
                 else
                   "ASC"
                 end
      @sortcol = params[:sortby].to_i
    end
    # in case sort column is not set, set the defaults
    if @sortcol.nil?
      @sortcol = 0
      @sortdir = "ASC"
    end
    params[:is_ascending] = @sortdir.to_s.downcase != "desc"
    @sortdir = params[:is_ascending] ? 'ASC' : 'DESC'
    @sortcol
  end

  # Common Saved Reports button handler routines
  def process_saved_reports(saved_reports, task)
    success_count = 0
    failure_count = 0
    params[:miq_grid_checks] = params[:miq_grid_checks]&.split(",")
    MiqReportResult.for_user(current_user).where(:id => saved_reports).order(MiqReportResult.arel_table[:name].lower).each do |rep|
      rep.public_send(task) if rep.respond_to?(task) # Run the task
    rescue StandardError
      failure_count += 1 # Push msg and error flag
    else
      if task == "destroy"
        AuditEvent.success(
          :event        => "rep_record_delete",
          :message      => "[#{rep.name}] Record deleted",
          :target_id    => rep.id,
          :target_class => "MiqReportResult",
          :userid       => current_userid
        )
        params[:miq_grid_checks]&.delete(rep[:id].to_s)
        success_count += 1
      else
        add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => rep.name, :task => task})
      end
    end
    if success_count.positive?
      add_flash(n_("Successfully deleted Saved Report from the %{product} Database",
                   "Successfully deleted Saved Reports from the %{product} Database", success_count) % {:product => Vmdb::Appliance.PRODUCT_NAME})
    end
    if failure_count.positive?
      add_flash(n_("Error during Saved Report delete from the %{product} Database",
                   "Error during Saved Reports delete from the %{product} Database", failure_count) % {:product => Vmdb::Appliance.PRODUCT_NAME})
    end
    params[:miq_grid_checks] || []
  end

  # Common timeprofiles button handler routines
  def process_timeprofiles(timeprofiles, task)
    process_elements(timeprofiles, TimeProfile, task)
  end

  def filter_ids_in_region(ids, label)
    in_reg, out_reg = ApplicationRecord.partition_ids_by_remote_region(ids)
    if ids.length == 1
      add_flash(_("The selected %{label} is not in the current region") % {:label => label}, :error) if in_reg.empty?
    elsif in_reg.empty?
      add_flash(_("All selected %{labels} are not in the current region") % {:labels => label.pluralize}, :error)
    else
      unless out_reg.empty?
        add_flash(
          n_("%{label} is not in the current region and will be skipped",
             "%{label} are not in the current region and will be skipped", out_reg.length) %
            {:label => pluralize(out_reg.length, label)}, :error
        )
      end
    end
    return in_reg, out_reg
  end

  def minify_ar_object(object)
    {:class => object.class.name, :id => object.id}
  end

  def dashboard_view
    false
  end

  def get_view_process_search_text(view)
    # Check for new search by name text entered
    if params[:search]
      @search_text = params[:search][:text].blank? ? nil : params[:search][:text].strip
    elsif params[:search_text] && @explorer
      @search_text = params[:search_text].blank? ? nil : params[:search_text].strip
    end

    return nil unless @search_text

    # Don't apply sub_filter when viewing sub-list view of a CI.
    # This applies when search is active and you go Vm -->
    # {Processes,Users,...} in that case, search shoult NOT be applied.
    # If loading a form such as provisioning, don't filter records
    # FIXME: This needs to be changed to apply search in some explicit way.
    return nil if @display || @in_a_form

    # If we came in through Chart pop-up menu click we don't filter records.
    return nil if session[:menu_click]

    # Build sub_filter where clause from search text
    # This part is for the Hosts screen. In explorer screens we have search (that includes vm_infra and Control/Explorer/Policies)
    if (!@parent && @lastaction == "show_list") || @explorer
      stxt = @search_text.gsub("_", "`_") # Escape underscores
      stxt.gsub!("%", "`%") # and percents

      stxt = if stxt.starts_with?("*") && stxt.ends_with?("*") # Replace beginning/ending * chars with % for SQL
               "%#{stxt[1..-2]}%"
             elsif stxt.starts_with?("*")
               "%#{stxt[1..-1]}"
             elsif stxt.ends_with?("*")
               "#{stxt[0..-2]}%"
             else
               "%#{stxt}%"
             end

      id = @search_text.to_i if /^\d+$/.match?(@search_text)
      condition = [[]]
      # also search by id if it is an int and not bigger then the max of bigint
      if id && id <= 9223372036854775807
        add_to_search_condition(condition, "#{view.db_class.table_name}.id = ?", id)
      end

      if ::Settings.server.case_sensitive_name_search
        add_to_search_condition(condition, "#{view.db_class.table_name}.#{view.col_order.first} like ? escape '`'", stxt)
      else
        add_to_search_condition(condition, "lower(#{view.db_class.table_name}.#{view.col_order.first}) like ? escape '`'", stxt.downcase)
      end
      condition[0] = condition[0].join(" OR ")
      return condition.flatten
    end
    nil
  end

  def add_to_search_condition(condition, query, values)
    condition[0] << query unless query.nil?
    condition << values unless values.nil?
    condition
  end

  def perpage_key(dbname)
    case dbname
    when "miqreportresult"
      :reports
    when "job", "miqtask"
      :job_task
    else
      :list
    end
  end

  def sanitize_filter(filter)
    return filter  if filter.kind_of?(MiqExpression)
    # when react list view is being rendered,
    # that sends up filter as hash in params, need to convert that back to an expression
    MiqExpression.new(filter["exp"].permit!.to_h.deep_stringify_keys)
  end

  # Create view and paginator for a DB records with/without tags
  def get_view(db, options = {}, fetch_data = false)
    if !fetch_data && @report_data_additional_options.nil?
      process_show_list_options(options, db)
    end
    if @in_a_form && @edit.present?
      object_ids = @edit[:object_ids] unless @edit[:object_ids].nil?
      object_ids = @edit[:pol_items] unless @edit[:pol_items].nil?
    end
    object_ids   = params[:records].map(&:to_i) unless params[:records].nil?
    db           = db.to_s
    dbname       = options[:dbname] || db.gsub('::', '_').downcase # Get db name as text
    db_sym       = (options[:gtl_dbname] || dbname).to_sym # Get db name as symbol
    refresh_view = false

    # Determine if the view should be refreshed or use the existing view
    unless session[:view] && # A view exists and
           session[:view].db.downcase == dbname && # the DB matches and
           params[:refresh] != "y" && # refresh not being forced and
           (
             params[:ppsetting] || params[:page] || # changed paging or
             params[:type]                          # gtl type
           )
      refresh_view = true
      # Creating a new view, remember if came from a menu_click
      session[:menu_click] = params[:menu_click] || options[:menu_click]
      session[:bc]         = params[:bc] # Remember incoming breadcrumb as well
    end

    # Build the advanced search @edit hash
    if (@explorer && !@in_a_form && !%w[adv_search_clear tree_select].include?(action_name)) ||
       (action_name == "show_list" && !session[:menu_click])
      adv_search_build(db)
    end
    if @edit && !@edit[:selected] && !@edit[:tagging] && # Load default search if search @edit hash exists
       settings(:default_search, db.to_sym) # and item in listnav not selected
      load_default_search(settings(:default_search, db.to_sym))
    end

    parent      = options[:parent] || nil             # Get passed in parent object
    @parent     = parent unless parent.nil?           # Save the parent object for the views to use
    association = options[:association] || nil        # Get passed in association (i.e. "users")
    view_suffix = options[:view_suffix] || nil        # Get passed in view_suffix (i.e. "VmReconfigureRequest")

    # Build sorting keys - Use association name, if available, else dbname
    # need to add check for miqreportresult, need to use different sort in savedreports/report tree for saved reports list
    sort_prefix = association || (dbname == "miqreportresult" && x_active_tree ? x_active_tree.to_s : dbname)
    sortcol_sym = "#{sort_prefix}_sortcol".to_sym
    sortdir_sym = "#{sort_prefix}_sortdir".to_sym

    # Get the view for this db or use the existing one in the session
    view =
      if options['report_name']
        path_to_report = ManageIQ::UI::Classic::Engine.root.join("product", "views", options['report_name']).to_s
        MiqReport.load_from_filename(path_to_report, {})
      else
        refresh_view ? get_db_view(db.gsub('::', '_'), :association => association, :view_suffix => view_suffix) : session[:view]
      end

    # Check for changed settings in params
    if params[:ppsetting] # User selected new per page value
      @settings.store_path(:perpage, perpage_key(dbname), params[:ppsetting].to_i)
    end

    if params[:sortby] # New sort order (by = col click, choice = pull down)
      params[:sortby]      = params[:sortby].to_i - 1
      params[:sort_choice] = view.headers[params[:sortby]]
    elsif params[:sort_choice] # If user chose new sortcol, set sortby parm
      params[:sortby]      = view.headers.index(params[:sort_choice])
    end

    report_symbols = [:all_sortcol, :savedreports_tree_sortcol, :reports_tree_sortcol]
    # Check if the symbol representing the page is included in the array above and then check if the variable for the sort column (session[sortcol_sym]) is nil
    if report_symbols.include?(sortcol_sym) && session[sortcol_sym].nil?
      session[sortcol_sym] = ReportController::DEFAULT_SORT_COLUMN_NUMBER
      session[sortdir_sym] = ReportController::DEFAULT_SORT_ORDER
    end
    # Get the current sort info, else get defaults from the view
    @sortcol = session[sortcol_sym].try(:to_i) || view.sort_col
    @sortdir = session[sortdir_sym] || (view.ascending? ? "ASC" : "DESC")

    # Set/reset the sortby column and order
    get_sort_col                                  # set the sort column and direction
    session[sortcol_sym] = @sortcol               # Save the new sort values
    session[sortdir_sym] = @sortdir
    view.sortby = [view.col_order[@sortcol]]      # Set sortby array in the view
    view.order = @sortdir == "ASC" ? "Ascending" : "Descending"

    @items_per_page = get_view_pages_perpage(dbname)
    @items_per_page = ONE_MILLION if db_sym.to_s == 'vm' && controller_name == 'service'

    @current_page = options[:page] || (params[:page].to_i < 1 ? 1 : params[:page].to_i)

    view.conditions = options[:conditions] # Get passed in conditions (i.e. tasks date filters)

    options[:filter] = sanitize_filter(options[:filter]) if options[:filter]

    # Save the paged_view_search_options for download buttons to use later
    session[:paged_view_search_options] = {
      :parent                    => parent ? minify_ar_object(parent) : nil,
      :parent_method             => options[:parent_method],
      :targets_hash              => true,
      :association               => association,
      :filter                    => get_view_filter(options[:filter]),
      :sub_filter                => get_view_process_search_text(view),
      :supported_features_filter => options[:supported_features_filter],
      :page                      => options[:all_pages] ? 1 : @current_page,
      :per_page                  => options[:all_pages] ? ONE_MILLION : @items_per_page,
      :where_clause              => get_chart_where_clause(options[:sb_controller]),
      :named_scope               => options[:named_scope],
      :display_filter_hash       => options[:display_filter_hash],
      :userid                    => session[:userid],
      :selected_ids              => object_ids,
      :match_via_descendants     => options[:match_via_descendants]
    }

    view.table, attrs = if fetch_data
                          # Call paged_view_search to fetch records and build the view.table and additional attrs
                          view.paged_view_search(session[:paged_view_search_options])
                        else
                          [{}, {}]
                        end

    # adding filters/conditions for download reports
    view.user_categories = attrs[:user_filters]["managed"] if attrs && attrs[:user_filters] && attrs[:user_filters]["managed"]

    view.extras[:auth_count]  = attrs[:auth_count]   if attrs[:auth_count]
    @targets_hash             = attrs[:targets_hash] if attrs[:targets_hash]

    # Set up the grid variables for list view, with exception models below
    if grid_hash_conditions(view) && fetch_data
      @grid_hash = view_to_hash(view, fetch_data)
    end

    [view, get_view_pages(dbname, view)]
  end

  def grid_hash_conditions(view)
    !%w[Job MiqProvision MiqReportResult MiqTask].include?(view.db) &&
      !(view.db.ends_with?("Build") && view.db != "ContainerBuild") &&
      !@force_no_grid_xml
  end

  def get_chart_where_clause(sb_controller = nil)
    # If doing charts, limit the records to ones showing in the chart
    sb_controller ||= params[:sb_controller]
    return if sb_controller.nil? || !session[:menu_click] || !session[:sandboxes][sb_controller][:chart_reports]

    chart_reports = session[:sandboxes][sb_controller][:chart_reports]
    chart_click = parse_chart_click(Array(session[:menu_click]).first)
    model_downcase = chart_click.model.downcase

    report = chart_reports.kind_of?(Array) ? chart_reports[chart_click.chart_index] : chart_reports
    data_row = report.table.data[chart_click.data_index]

    if chart_click.type == "bytag"
      ["\"#{model_downcase.pluralize}\".id IN (?)",
       data_row["assoc_ids_#{report.extras[:group_by_tags][chart_click.legend_index]}"][model_downcase.to_sym][:on]]
    else
      ["\"#{model_downcase.pluralize}\".id IN (?)",
       data_row["assoc_ids"][model_downcase.to_sym][chart_click.type.to_sym]]
    end
  end

  def get_view_filter(default_filter)
    # Get the advanced search filter
    filter = nil
    if @edit && @edit[:adv_search_applied] && !session[:menu_click]
      filter = MiqExpression.new(@edit[:adv_search_applied][:qs_exp] || @edit[:adv_search_applied][:exp])
    end

    # workaround to pass MiqExpression as a filter to paged_view_search for MiqRequest
    # show_list, can't be used with advanced search or other list view screens
    filter || default_filter
  end

  def get_view_pages_perpage(dbname)
    settings_default(10, :perpage, perpage_key(dbname))
  end

  # Create the pages hash and return with the view
  def get_view_pages(dbname, view)
    pages = {
      :perpage => get_view_pages_perpage(dbname),
      :current => params[:page].nil? ? 1 : params[:page].to_i,
      :items   => view.extras[:auth_count]
    }
    if pages[:items] && pages[:perpage]
      pages[:total] = (pages[:items] + pages[:perpage] - 1) / pages[:perpage]
    end
    pages
  end

  def get_db_view(db, options = {})
    if %w[ManageIQ_Providers_InfraManager_Template ManageIQ_Providers_InfraManager_Vm]
       .include?(db) && options[:association] == "all_vms_and_templates"
      options[:association] = nil
    end

    process_show_list_options(options, db) if @report_data_additional_options.nil?

    MiqReport.load_from_view_options(db, current_user, options, db_view_yaml_cache)
  end

  def db_view_yaml_cache
    Rails.env.development? ? {} : @db_view_yaml ||= {}
  end

  def render_or_redirect_partial(pfx)
    if @redirect_controller
      if ["#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed])
        if flash_errors?
          javascript_flash
        else
          javascript_redirect(:controller => @redirect_controller,
                              :action     => @refresh_partial,
                              :id         => @redirect_id,
                              :prov_type  => @prov_type,
                              :prov_id    => @prov_id)
        end
      else
        javascript_redirect(:controller => @redirect_controller, :action => @refresh_partial, :id => @redirect_id, :template_klass => @template_klass_type)
      end
    elsif params[:pressed] == "ems_cloud_edit" && params[:id]
      javascript_redirect(edit_ems_cloud_path(params[:id]))
    elsif params[:pressed] == "ems_infra_edit" && params[:id]
      javascript_redirect(edit_ems_infra_path(params[:id]))
    elsif params[:pressed] == "ems_container_edit" && params[:id]
      javascript_redirect(edit_ems_container_path(params[:id]))
    elsif params[:pressed] == "ems_network_edit" && params[:id]
      javascript_redirect(edit_ems_network_path(params[:id]))
    elsif params[:pressed] == "ems_physical_infra_edit" && params[:id]
      javascript_redirect(edit_ems_physical_infra_path(params[:id]))
    elsif params[:pressed] == "ems_storage_edit" && params[:id]
      javascript_redirect(edit_ems_storage_path(params[:id]))
    else
      javascript_redirect(:action => @refresh_partial, :id => @redirect_id)
    end
  end

  def replace_list_grid
    view = @view
    button_div = 'center_tb'
    action_url = if @lastaction == "scan_history"
                   "scan_history"
                 elsif %w[all_jobs jobs ui_jobs all_ui_jobs].include?(@lastaction)
                   "jobs"
                 elsif @lastaction == "get_node_info"
                   nil
                 elsif !@lastaction.nil?
                   @lastaction
                 else
                   "show_list"
                 end

    ajax_url = !%w[SecurityGroup CloudVolume].include?(view.db)
    ajax_url = false if request.parameters[:controller] == "service" && view.db == "Vm"
    ajax_url = false unless @explorer

    url = @showlinks == false ? nil : view_to_url(view, @parent)
    grid_options = {:grid_id    => "list_grid",
                    :grid_name  => "gtl_list_grid",
                    :grid_hash  => @grid_hash,
                    :button_div => button_div,
                    :action_url => action_url}
    js_options = {:sortcol      => @sortcol || nil,
                  :sortdir      => @sortdir ? @sortdir[0..2] : nil,
                  :row_url      => url,
                  :row_url_ajax => ajax_url}

    [grid_options, js_options]
  end

  # RJS code to show tag box effects and replace the main list view area
  def replace_gtl_main_div(_options = {})
    return if params[:action] == "button" && @lastaction == "show"

    if @grid_hash
      # need to call this outside render :update
      grid_options, js_options = replace_list_grid
    end

    render :update do |page|
      page << javascript_prologue
      page.replace(:flash_msg_div, :partial => "layouts/flash_msg") # Replace the flash message
      page << "miqScrollTop();" if @flash_array.present?
      page << "miqSetButtons(0, 'center_tb');" # Reset the center toolbar
      if layout_uses_listnav?
        page.replace(:listnav_div, :partial => "layouts/listnav") # Replace accordion, if list_nav_div is there
      end
      if @grid_hash
        page.replace_html("list_grid", :partial => "layouts/list_grid", :locals => {:options => grid_options, :js_options => js_options})
        # Reset the center buttons
        page << "miqGridOnCheck();"
      else
        # No grid, replace the gtl div
        # Replace the main div area contents
        page.replace_html("main_div", :partial => "layouts/gtl")
        page << "$('#adv_div').slideUp(0.3);" if params[:entry]
      end
    end
  end

  # Build the audit payload when a record is created, including all of the new fields
  #
  # @param rec [ActiveRecord::Base] Database record
  # @param eh [Hash] edit hash containing new values
  def build_created_audit(rec, eh)
    build_audit_payload(rec, eh[:new], nil, "#{rec.class.to_s.downcase}_record_add", "Record created")
  end

  # Build the audit payload when a record is created, including all of the changed fields
  #
  # @param rec [ActiveRecord::Base] Database record
  # @param eh [Hash] edit hash containing current and new values
  def build_saved_audit(rec, eh)
    build_audit_payload(rec, eh[:new], eh[:current], "#{rec.class.to_s.downcase}_record_update", "Record updated")
  end

  # Build the audit payload when configuration is changed in configuration and ops controllers
  #
  # @param eh [Hash] edit hash containing current and new values
  def build_config_audit(eh)
    if controller_name == "ops" && @sb[:active_tab] == "settings_server"
      server = MiqServer.find(@sb[:selected_server_id])
      message = "Server [#{server.name}] (#{server.id}) in Zone [#{server.my_zone}] VMDB config updated"
    else
      message = "VMDB config updated"
    end

    build_audit_payload(nil, eh[:new], eh[:current], "vmdb_config_update", message, "")
  end

  def build_audit_payload(rec, eh_new, eh_current, event, message, description = nil)
    description ||= eh_new[:name]
    description ||= rec[:name] if rec
    message = "[#{description}] #{message}" if description.present?

    changes = build_audit_payload_changes(eh_new, eh_current)
    message = "#{message} (#{changes})" if changes

    {
      :event   => event,
      :userid  => session[:userid],
      :message => message
    }.tap do |payload|
      if rec
        payload[:target_id]    = rec.id
        payload[:target_class] = rec.class.base_class.name
      end
    end
  end

  def build_audit_payload_changes(new, current)
    if current
      current = current.deep_clone
      diff = Vmdb::Settings::HashDiffer.diff(current, new)
      Vmdb::Settings.mask_passwords!(current)
    else
      diff = new.deep_clone
    end
    Vmdb::Settings.mask_passwords!(diff)

    # Pull the keys out of current that match the diff's keys and format as a list from/to changes
    #
    # TODO: Move this into the Vmdb::Settings::HashDiffer class as a method that
    #       returns the diff with both sides included
    changes = []
    Vmdb::SettingsWalker.walk(diff) do |_key, value, key_path, _settings|
      next if value.kind_of?(Hash) || value.kind_of?(Array) # skip full hashes and arrays

      change = {:key => key_path.join("/"), :to => value}
      change[:from] = current.dig(*key_path) if current
      changes << change
    end
    changes.map { |c| "#{c[:key]}:#{"[#{c[:from]}] to " if c.key?(:from)}[#{c[:to]}]" }.join(", ").presence
  end

  #
  # This method is ONLY called from prov_redirect method.
  # prov_redirect is ONLY called with one of 4 parameters:
  #   "clone", "migrate", "publish" and nil (meaning "provisioning")
  #
  # renders a flash message in case the records do not support the task
  #
  def task_supported(typ)
    vms = find_records_with_rbac(VmOrTemplate, checked_or_params)
    if %w[migrate publish].include?(typ) && vms.any?(&:template?)
      render_flash_not_applicable_to_model(typ, ui_lookup(:table => "miq_template"))
      return
    end

    if typ == "migrate"
      # if one of the providers in question cannot support simultaneous migration of his subset of
      # the selected VMs, we abort
      if vms.group_by(&:ext_management_system).except(nil).any? do |ems, ems_vms|
        ems.respond_to?(:supports_migrate_for_all?) && !ems.supports_migrate_for_all?(ems_vms)
      end
        add_flash(_("These VMs can not be migrated together."), :error)
        return
      end
    end

    vms.each do |vm|
      render_flash_not_applicable_to_model(typ) unless vm.supports?(typ)
    end
  end

  def prov_redirect(typ = nil)
    assert_privileges(params[:pressed])
    # we need to do this check before doing anything to prevent
    # history being updated
    task_supported(typ) if typ
    return if performed?

    @redirect_controller = "miq_request"
    # non-explorer screens will perform render in their respective button method
    return if flash_errors?

    @in_a_form = true
    @template_klass_type = template_types_for_controller
    @org_controller = "vm" # request originated from controller
    @refresh_partial = typ ? "prov_edit" : "pre_prov"
    if typ
      prov_obj = find_record_with_rbac(VmOrTemplate, checked_or_params)
      @prov_id = prov_obj.id
      case typ
      when "clone"
        @prov_type = prov_obj.template? ? "clone_to_template" : "clone_to_vm"
      when "migrate"
        @prov_id = [@prov_id]
        @prov_type = "migrate"
      when "publish"
        @prov_type = "clone_to_template"
      end
      @_params[:prov_id] = @prov_id
      @_params[:prov_type] = @prov_type
    end

    if @explorer
      @_params[:org_controller] = "vm"
      if typ
        prov_edit
      else
        if %w[image_miq_request_new miq_template_miq_request_new].include?(params[:pressed])
          # skip pre prov grid
          set_pre_prov_vars
          template = find_record_with_rbac(VmOrTemplate, checked_or_params)

          render_flash_not_applicable_to_model("provisioning") unless template.supports?(:provisioning)
          return if performed?

          @edit[:src_vm_id] = template
          session[:edit] = @edit
          @_params[:button] = "continue"
        end
        vm_pre_prov
      end
    end
  end
  alias image_miq_request_new prov_redirect
  alias instance_miq_request_new prov_redirect
  alias vm_miq_request_new prov_redirect
  alias miq_template_miq_request_new prov_redirect

  def template_types_for_controller
    if %w[ems_cluster ems_infra host resource_pool storage vm_infra].include?(params[:controller])
      'infra'
    else
      'cloud'
    end
  end

  def vm_clone
    @record = identify_record(params[:id], controller_to_model)

    prov_redirect("clone")
  end
  alias image_clone vm_clone
  alias instance_clone vm_clone
  alias miq_template_clone vm_clone

  def vm_migrate
    @record = identify_record(params[:id], controller_to_model)

    prov_redirect("migrate")
  end
  alias miq_template_migrate vm_migrate

  def vm_publish
    @record = identify_record(params[:id], controller_to_model)

    prov_redirect("publish")
  end
  alias instance_publish vm_publish

  def get_global_session_data
    # Set the current userid in the User class for this thread for models to use
    User.current_user = current_user
    # if session group for user != database group for the user then ensure it is a valid group
    if current_user.try(:current_group_id_changed?) && !current_user.miq_groups.include?(current_group)
      handle_invalid_session(true)
      return
    end

    # Get/init sandbox (@sb) per controller in the session object
    session[:sandboxes] ||= HashWithIndifferentAccess.new
    @sb = session[:sandboxes][controller_name].blank? ? {} : copy_hash(session[:sandboxes][controller_name])

    # Init view sandbox variables
    @current_page = @sb[:current_page]                                              # current page number
    @search_text = @sb[:search_text]                                                # search text
    @detail_sortcol = @sb[:detail_sortcol].nil? ? 0 : @sb[:detail_sortcol].to_i   # sort column for detail lists
    @detail_sortdir = @sb[:detail_sortdir].nil? ? "ASC" : @sb[:detail_sortdir]    # sort column for detail lists

    # Get performance hash, if it is in the sandbox for the running controller
    @perf_options = Performance::Options.load_from_hash(@sb[:perf_options])

    # Set @edit key default for the expression editor to use
    @expkey = session[:expkey] || :expression

    # Get timelines hash, if it is in the session for the running controller
    @tl_options = tl_session_data

    session[:host_url] = request.host_with_port

    # Get all of the global variables used by most of the controllers
    @pp_choices = PPCHOICES
    @panels = session[:panels].nil? ? {} : session[:panels]
    @breadcrumbs = session[:breadcrumbs].nil? ? [] : session[:breadcrumbs]
    @panels["icon"] = true if @panels["icon"].nil?                # Default icon panels to be open
    @panels["tag_filters"] = true if @panels["tag_filters"].nil?  # Default tag filters panels to be open
    @panels["sections"] = true if @panels["sections"].nil?        # Default sections(compare) panel to be open

    # Incoming flash msg array is present
    if session[:flash_msgs]
      @flash_array = session[:flash_msgs].dup
      session[:flash_msgs] = nil
    # Add incoming flash msg, with/without error flag
    elsif params[:flash_msg]
      # params coming in from redirect are strings and being sent up even when value is false
      if params[:flash_error] == "true"
        add_flash(params[:flash_msg], :error)
      elsif params[:flash_warning]
        add_flash(params[:flash_msg], :warning)
      else
        add_flash(params[:flash_msg])
      end
    end

    # Get settings hash from the session
    @settings = session[:settings]
    @css = session[:css]
    # Get edit hash from the session
    # Commented following line in sprint 39. . . controllers should load @edit if they need it and we will
    # automatically save it in the session if it's present when the transaction ends
    #   @edit = session[:edit] ? session[:edit] : nil
    true # If we don't return true, the entire session stops cold
  end

  def set_global_session_data
    @sb ||= {}
    # Set all of the global variables used by most of the controllers
    session[:layout] = @layout
    session[:panels] = @panels
    session[:breadcrumbs] = @breadcrumbs
    session[:applied_tags] = @applied_tags # Search box applied tags for the current list view
    session[:miq_compare] = @compare.nil? ? (@keep_compare ? session[:miq_compare] : nil) : Marshal.dump(@compare)
    session[:miq_compressed] = @compressed unless @compressed.nil?
    session[:miq_exists_mode] = @exists_mode unless @exists_mode.nil?
    session[:last_trans_time] = Time.now

    # Set timelines hash, if it is in the session for the running controller
    set_tl_session_data

    # Capture breadcrumbs by main tab
    session[:tab_bc] ||= {}
    unless session[:menu_click] # Don't save breadcrumbs after a chart menu click
      case controller_name

      # These controllers don't use breadcrumbs, see above get method to store URL
      when "dashboard", "report", "support", "alert", "alert_center", "jobs", "ui_jobs", "miq_ae_tools", "miq_policy", "miq_action", "chargeback", "service", "utilization"

      when "ems_cloud", "availability_zone", "host_aggregate", "flavor"
        session[:tab_bc][:clo] = @breadcrumbs.dup if %(show show_list).include?(action_name)
      when "ems_infra", "datacenter", "ems_cluster", "resource_pool", "storage", "pxe_server"
        session[:tab_bc][:inf] = @breadcrumbs.dup if %(show show_list).include?(action_name)
      when "host"
        session[:tab_bc][:inf] = @breadcrumbs.dup if %w[show show_list log_viewer].include?(action_name)
      when "miq_request"
        if @layout == "miq_request_vm" && %w[show show_list].include?(action_name)
          session[:tab_bc][:vms] = @breadcrumbs.dup
        elsif %w[show show_list].include?(action_name)
          session[:tab_bc][:inf] = @breadcrumbs.dup
        end
      when "vm"
        session[:tab_bc][:vms] = @breadcrumbs.dup if %w[
          show
          show_list
          usage
          guest_applications
          registry_items
          vmtree
          users
          groups
          linuxinitprocesses
          win32services
          kerneldrivers
          filesystemdrivers
        ].include?(action_name)
      end
    end

    # Save settings hash in the session
    session[:settings] = @settings
    session[:css] = @css

    # Save/reset session variables based on @variable presence
    session[:imports] = @sb[:imports] || nil # Imported file data from 2 stage import

    # Save @edit and @view in session, if present
    if @lastaction == "show_list"                           # If show_list was the last screen presented or tree is being autoloaded save @edit
      @edit ||= session[:edit]                              #   Remember the previous @edit
      @view ||= session[:view]                              #   Remember the previous @view
    end

    # Save @edit key for the expression editor to use
    session[:expkey] = @expkey
    @edit[@expkey].drop_cache if @edit && @edit[@expkey]

    session[:edit] = @edit || nil                    # Set or clear session edit hash

    session[:view] = @view || nil                    # Set or clear view in session hash
    unless params[:controller] == "miq_task"                # Proxy needs data for delete all
      session[:view].table = nil if session[:view]          # Don't need to carry table data around
    end

    # Put performance hash, if it exists, into the sandbox for the running controller
    @sb[:perf_options] = @perf_options.to_h

    # Save @assign hash in sandbox
    @sb[:assign] = @assign ? copy_hash(@assign) : nil

    # Save view sandbox variables
    @sb[:current_page] = @current_page
    @sb[:search_text] = @search_text
    @sb[:detail_sortcol] = @detail_sortcol
    @sb[:detail_sortdir] = @detail_sortdir

    # Set/clear sandbox (@sb) per controller in the session object
    session[:sandboxes] ||= HashWithIndifferentAccess.new
    session[:sandboxes][controller_name] = @sb.blank? ? nil : copy_hash(@sb)

    # Clear out pi_xml and pi from sandbox if not in policy controller or no longer need to hang on to policy import data, clearing it out incase user switched screen before importing data
    if session[:sandboxes][:miq_policy] && (request.parameters[:controller] != "miq_policy" || (request.parameters[:controller] == "miq_policy" && !params[:commit] && !params[:button]))
      session[:sandboxes][:miq_policy][:pi_xml] = nil
      session[:sandboxes][:miq_policy][:pi]     = nil
    end

    # Clearing out session objects that are no longer needed
    session[:resolve] = session[:resolve_object] = nil unless %w[catalog miq_ae_customization miq_ae_tools].include?(request.parameters[:controller])
    session[:report_menu] = session[:report_folders] = session[:menu_roles_tree] = nil if controller_name != "report"
    if session.class != Hash
      session_hash = session.respond_to?(:to_hash) ? session.to_hash : session.data
      get_data_size(session_hash)
      dump_session_data(session_hash) if ::Settings.product.dump_session
    end
  end

  def find_filtered(db)
    user     = current_user
    mfilters = user ? user.get_managed_filters : []
    bfilters = user ? user.get_belongsto_filters : []

    result = if db.respond_to?(:find_tags_by_grouping) && !mfilters.empty?
               db.find_tags_by_grouping(mfilters, :ns => "*")
             else
               db.all
             end

    result = MiqFilter.apply_belongsto_filters(result, bfilters) if db.respond_to?(:apply_belongsto_filters) && result

    result
  end

  VISIBILITY_TYPES = {'role' => 'role', 'group' => 'group', 'all' => 'all'}.freeze

  def visibility_box_edit
    typ_changed = params[:visibility_typ].present?
    @edit[:new][:visibility_typ] = VISIBILITY_TYPES[params[:visibility_typ]] if typ_changed

    visibility_typ = @edit[:new][:visibility_typ]
    if %w[role group].include?(visibility_typ)
      plural = visibility_typ.pluralize
      key    = plural.to_sym
      prefix = "#{plural}_"

      @edit[:new][key] = [] if typ_changed
      params.each do |var, value|
        next unless var.starts_with?(prefix)

        name = var.split(prefix).last
        if value == "1"
          @edit[:new][key] |= [name] # union
        elsif value.downcase == "null"
          @edit[:new][key].delete(name)
        end
      end
    else
      @edit[:new][:roles] ||= []
      @edit[:new][:roles] |= ["_ALL_"]
    end
  end

  def get_record_display_name(record)
    return record.label                      if record.respond_to?("label")
    return record.name                       if record.respond_to?("name")
    return record.description                if record.respond_to?("description") && record.description.present?
    return record.ext_management_system.name if record.respond_to?("ems_id")
    return record.title                      if record.respond_to?("title")

    "<Record ID #{record.id}>"
  end

  def identify_tl_or_perf_record
    identify_record(params[:id], controller_to_model)
  end

  def assert_privileges(*features, any: false)
    msg = "Features checked: #{features.join(', ')}"

    pass =
      if any
        role_allows?(:feature => features.first, :any => true)
      else
        features.any? { |feature| role_allows?(:feature => feature) }
      end

    log_privileges(pass, msg)
    raise MiqException::RbacPrivilegeException, _('The user is not authorized for this task or item.') unless pass
  end

  def log_privileges(pass, details = nil)
    # This is called with or without a current user and possibly a fake request such as in test.
    username    = current_userid rescue nil
    role_name   = current_user.miq_user_role.name rescue nil
    http_method = request.respond_to?(:request_method) ? request.request_method   : nil
    path        = request.respond_to?(:filtered_path)  ? request.filtered_path    : nil
    request_id  = request.respond_to?(:request_id)     ? request.request_id       : nil
    session_id  = request.respond_to?(:session)        ? request.session.try(:id) : nil

    msg = "Username [#{username}], Role [#{role_name}], Session [#{session_id}], Request [#{request_id}], Method [#{http_method}], Path [#{path}] #{details}"

    pass ? $audit_log.success(msg) : $audit_log.failure(msg)
  end

  # Method tests, whether the user has rights to access records sent in request
  # Params:
  #   klass - class of accessed objects
  #   ids   - array of accessed object ids
  # TODO: drop this method and just use Rbac in sql queries
  def assert_rbac(klass, ids)
    num_visible = Rbac.filtered(klass.where(:id => ids), :user => current_user).count
    raise _("Unauthorized object or action") unless ids.length == num_visible
  end

  def last_screen_url
    @breadcrumbs.last[:url]
  end
  helper_method(:last_screen_url)

  def previous_breadcrumb_url
    @breadcrumbs[-2][:url]
  end
  helper_method(:previous_breadcrumb_url)

  def previous_page_url
    if params[:id]
      show_url = "/#{params[:controller]}/show"
      previous_breadcrumb_url == show_url ? "#{show_url}/#{params[:id]}" : previous_breadcrumb_url
    elsif params[:miq_grid_checks]
      "/#{params[:controller]}/show_list"
    else
      previous_breadcrumb_url
    end
  end

  def controller_for_common_methods
    case controller_name
    when "vm_infra", "vm_or_template", "vm_cloud"
      "vm"
    when "generic_object_definition" # tagging for nested list on the generic object class
      "generic_object"
    when "ansible_playbook", "workflow"
      "embedded_configuration_script_payload"
    when "workflow_repository"
      "ansible_repository"
    else
      controller_name
    end
  end

  def reload_trees_by_presenter(presenter, trees)
    trees.each do |tree|
      next if tree.blank?

      presenter.reload_tree(tree.name, tree.locals_for_render[:bs_tree])
    end
  end

  def list_row_id(row)
    row['id'].to_s
  end

  def render_flash_not_applicable_to_model(type, model_type = nil)
    if model_type
      add_flash(_("%{task} does not apply to at least one of the selected %{model}") %
                  {:model => model_type,
                   :task  => type.split.map(&:capitalize).join(' ')}, :error)
    else
      add_flash(_("%{task} does not apply to at least one of the selected items") %
                  {:task => type.split.map(&:capitalize).join(' ')}, :error)
    end
    javascript_flash if @explorer
  end

  def set_gettext_locale
    FastGettext.set_locale(LocaleResolver.resolve(current_user, request.headers))
  end

  def flip_sort_direction(direction)
    direction == "ASC" ? "DESC" : "ASC" # flip ascending/descending
  end

  def skip_breadcrumb?
    false
  end

  def restful?
    false
  end
  public :restful?

  def validate_before_save?
    false
  end
  public :validate_before_save?

  def determine_record_id_for_presenter
    if @in_a_form && !@angular_form
      @edit && @edit[:rec_id]
    else
      @record.try!(:id)
    end
  end

  # Set active tree and accordion according to given node.
  # Optionally set x_node.
  #
  # Warning: the new x_node must exist in the tree.
  #
  def set_active_elements(feature, x_node_to_set = nil)
    if feature
      self.x_active_tree ||= feature.tree_name
      self.x_active_accord ||= feature.accord_name
    end

    self.x_node = x_node_to_set if x_node_to_set.present?
    get_node_info(x_node)
  end

  # reset node to root node when previously viewed item no longer exists
  def set_root_node
    self.x_node = "root"
    get_node_info(x_node)
  end

  def clear_flash_msg
    @flash_array = nil if params[:button] != "reset"
  end

  # Build all trees and accordions accoding to features available to the current user.

  def build_accordions_and_trees_only
    # Build the Explorer screen from scratch
    allowed_features = ApplicationController::Feature.allowed_features(features)
    @trees = allowed_features.collect { |feature| feature.build_tree(@sb) }
    @accords = allowed_features.map(&:accord_hash)

    allowed_features
  end

  def build_accordions_and_trees(x_node_to_set = nil)
    allowed_features = build_accordions_and_trees_only

    # TODO: should we handle this through assert_privileges?
    raise MiqException::RbacPrivilegeException, _("The user is not authorized for this task or item.") if allowed_features.empty?

    set_active_elements(allowed_features.first, x_node_to_set)
  end

  def assert_accordion_and_tree_privileges(tree_name)
    feature = features.find { |feat| feat.tree_name.to_sym == tree_name.to_sym }
    return if feature.blank?

    assert_privileges(feature.role, :any => feature.role_any)
  end

  def fetch_name_from_object(klass, id)
    klass.find_by(:id => id).try(:name)
  end
end

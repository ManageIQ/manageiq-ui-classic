module ReportController::Reports::Editor
  extend ActiveSupport::Concern
  include ReportController::Reports::EditorMapping

  DEFAULT_PDF_PAGE_SIZE = "US-Letter".freeze
  PREVIEW_ROW_LIMIT = 100

  # Helper endpoints are used while adding as well as while editing a report
  EDITOR_FEATURES = %w[miq_report_new miq_report_edit].freeze

  # Actions that serve the editor for either a new or an existing report
  EDITOR_ACTIONS = %i[
    form_data
    available_fields
    save
    preview
    preview_result
    trend_limit_cols
    chargeback_options
    chargeback_entities
  ].freeze

  def self.chart_top_values
    ::Settings.reporting.chart_top_values
  end

  def miq_report_copy
    assert_privileges("miq_report_copy")
    javascript_redirect(:controller => "report", :action => "copy", :id => params[:id])
  end

  # GET /report/new
  # Renders the page that mounts the React report editor for a new report.
  def new
    assert_privileges("miq_report_new")
    @record_id = "new"
    drop_breadcrumb(:name => _("Add a new Report"), :url => url_for_only_path(:action => "new"))
    render_report_editor
  end

  # GET /report/edit/:id
  # Renders the page that mounts the React report editor for an existing report.
  def edit
    assert_privileges("miq_report_edit")
    rpt = find_record_with_rbac(MiqReport, params[:id])
    if rpt.rpt_type == "Default"
      flash_to_session(_('Default reports can not be edited'), :error)
      redirect_to(:action => "explorer")
      return
    end
    @record_id = rpt.id.to_s
    drop_breadcrumb(:name => _("Edit Report \"%{name}\"") % {:name => rpt.name}, :url => url_for_only_path(:action => "edit", :id => rpt.id))
    render_report_editor
  end

  # GET /report/copy/:id
  # Renders the React report editor for a new report that starts as a copy of
  # the report with the given id. The editor loads the source through
  # form_data?copy_from=:id.
  def copy
    assert_privileges("miq_report_copy")
    assert_privileges("miq_report_new")
    rpt = find_record_with_rbac(MiqReport, params[:id])
    @record_id = "new"
    @copy_from = rpt.id.to_s
    drop_breadcrumb(:name => _("Add a new Report"), :url => url_for_only_path(:action => "copy", :id => rpt.id))
    render_report_editor
  end

  # GET /report/form_data(/:id)
  # Returns all data needed to populate the React report editor.
  # When id is "new" and copy_from is supplied, pre-populate from the source report.
  def form_data
    if params[:id] && params[:id] != "new"
      assert_privileges("miq_report_edit")
      rpt = find_record_with_rbac(MiqReport, params[:id])
      return render_default_report_error if rpt.rpt_type == "Default"

      report_attrs = serialize_report_attrs(rpt)
    elsif params[:copy_from].present?
      assert_privileges("miq_report_new")
      rpt = find_record_with_rbac(MiqReport, params[:copy_from])
      # The copy is a new custom report, so it must not carry the identity of the source
      report_attrs = serialize_report_attrs(rpt).merge(:record_id => nil, :name => _("Copy of %{name}") % {:name => rpt.name})
    else
      assert_privileges("miq_report_new")
      report_attrs = {
        :name          => "",
        :title         => "",
        :model         => nil,
        :col_order     => [],
        :headers       => [],
        :col_formats   => [],
        :col_options   => {},
        :sortby        => nil,
        :order         => "Ascending",
        :group         => nil,
        :row_limit     => nil,
        :graph_type    => nil,
        :graph_count   => ReportController::Reports::Editor.chart_top_values,
        :graph_other   => true,
        :graph_mode    => "counts",
        :graph_column  => "",
        :pdf_page_size => DEFAULT_PDF_PAGE_SIZE,
        :queue_timeout => nil,
        :db_options    => {}
      }
    end

    # Per-field metadata for the selected columns, so the summary, formatting and
    # styling tabs have it without waiting for the field picker to load.
    field_metadata = Array(report_attrs[:col_order]).index_with { |field_id| field_metadata_for(field_id) }

    render :json => {
      :report                     => report_attrs,
      :report_type                => report_type_for_model(rpt&.db),
      :models                     => reportable_models,
      :chart_types                => ManageIQ::Reporting::Charting.chart_names_for_select,
      :pdf_page_sizes             => ViewHelper::PDF_PAGE_SIZES.map { |k, v| [_(v), k] },
      :style_classes              => ReportHelper::STYLE_CLASSES.transform_values { |v| _(v) },
      :queue_timeout_options      => queue_timeout_options,
      :field_metadata             => field_metadata,
      :unavailable_fields_warning => rpt ? unavailable_fields_for_model(rpt.db) : nil
    }
  end

  # GET /report/available_fields?model=SomeModel[&perf_interval=daily]
  # Returns the reportable fields of a model with the metadata the editor needs.
  # perf_interval is used for trend/performance models (daily or hourly).
  def available_fields
    assert_privileges(*EDITOR_FEATURES)
    model = params[:model].to_s.strip
    if model.blank? || MiqReport.reportable_models.exclude?(model)
      render :json => {:success => false, :message => _("Invalid or missing model")}, :status => 422
      return
    end
    perf_interval = params[:perf_interval].presence
    fields = perf_interval ? MiqExpression.reporting_available_fields(model, perf_interval) : MiqExpression.reporting_available_fields(model)
    field_metadata = fields.to_h { |(_label, field_id)| [field_id, field_metadata_for(field_id)] }
    render :json => {:fields => fields, :field_metadata => field_metadata}
  end

  # POST /report/save(/:id)
  # Saves (create or update) a report from a JSON body.
  def save
    id = params[:id]
    if id && id != "new"
      assert_privileges("miq_report_edit")
      rpt = find_record_with_rbac(MiqReport, id)
      return render_default_report_error if rpt.rpt_type == "Default"
    else
      assert_privileges("miq_report_new")
      rpt = MiqReport.new
    end

    report_data = report_data_param
    return render_missing_report_data if report_data.nil?

    previous_name  = rpt.name
    previous_attrs = report_audit_attrs(rpt)

    assign_report_attributes(rpt, report_data)
    errors = report_validation_errors(rpt, report_data, report_type_for_model(rpt.db))
    if errors.present?
      render :json => {:success => false, :message => errors.join(", ")}, :status => 422
      return
    end

    unless rpt.save
      render :json => {:success => false, :message => rpt.errors.full_messages.join(", ")}, :status => 422
      return
    end

    if previous_name.present?
      menu_repname_update(previous_name, rpt.name) if previous_name != rpt.name
      AuditEvent.success(build_saved_audit(rpt, :new => report_audit_attrs(rpt), :current => previous_attrs))
    else
      AuditEvent.success(build_created_audit(rpt, :new => report_audit_attrs(rpt)))
    end
    populate_reports_menu
    render :json => {:success => true, :message => _("Report was saved"), :id => rpt.id}
  end

  # POST /report/preview
  # Builds a temporary MiqReport from the posted report_data and queues its generation
  # (limited to PREVIEW_ROW_LIMIT rows) on a reporting worker, so a slow report does not
  # hold a web worker. Returns { task_id: } to poll with preview_result.
  # Without columns there is nothing to generate and { columns: [], rows: [] } is returned.
  def preview
    assert_privileges(*EDITOR_FEATURES)

    report_data = report_data_param
    return render_missing_report_data if report_data.nil?

    if Array(report_data[:col_order]).blank?
      render :json => {:columns => [], :rows => []}
      return
    end

    rpt = MiqReport.new
    assign_report_attributes(rpt, report_data)
    rpt.name  = rpt.name.presence || _("Preview")
    rpt.title = rpt.title.presence || _("Preview")

    task_id = rpt.async_generate_table(
      :userid     => session[:userid],
      :session_id => request.session_options[:id],
      :limit      => PREVIEW_ROW_LIMIT,
      :mode       => "adhoc"
    )
    # Only the task started here may be read back through preview_result
    session[:report_preview_task_id] = task_id
    render :json => {:task_id => task_id}
  end

  # GET /report/preview_result?task_id=123
  # Polled by the editor after #preview. Returns { complete: false } while the task runs,
  # then { columns:, col_keys:, rows: }. The task and its result are removed once read.
  def preview_result
    assert_privileges(*EDITOR_FEATURES)

    task_id = params[:task_id].to_i
    task = session[:report_preview_task_id] == task_id ? MiqTask.find_by(:id => task_id) : nil
    if task.nil?
      render :json => {:success => false, :message => _("Report preview not found")}, :status => 404
      return
    end

    unless task.state == MiqTask::STATE_FINISHED
      render :json => {:complete => false}
      return
    end

    session[:report_preview_task_id] = nil
    unless task.results_ready?
      $log.error("MIQ(#{self.class.name}#preview_result) Failed to generate the report preview: #{task.message}")
      task.destroy
      render :json => {:success => false, :message => _("Failed to generate the report preview")}, :status => 422
      return
    end

    render :json => {:complete => true}.merge(preview_payload(task.miq_report_result.report_results))
    task.miq_report_result.destroy
    task.destroy
  end

  # GET /report/trend_limit_cols?trend_col=VmPerformance-cpu_usagemhz_rate_average&perf_interval=daily
  # Returns the limit column choices for a given trend column selection.
  def trend_limit_cols
    assert_privileges(*EDITOR_FEATURES)
    trend_col_id = params[:trend_col].to_s.strip
    perf_interval = params[:perf_interval].to_s.strip.presence || "daily"
    if trend_col_id.blank?
      render :json => {:limit_cols => []}
      return
    end
    trend_db, trend_col = trend_col_id.split("-", 2)
    limit_cols = VimPerformanceTrend.trend_limit_cols(trend_db, trend_col, perf_interval)
    render :json => {:limit_cols => limit_cols}
  end

  # GET /report/chargeback_options?model=ChargebackVm
  # Returns option lists needed to render the chargeback filter tab.
  def chargeback_options
    assert_privileges(*EDITOR_FEATURES)

    model = params[:model].to_s.strip
    unless chargeback_report_model?(model)
      render :json => {:success => false, :message => _("Invalid or non-chargeback model")}, :status => 422
      return
    end

    cb_model = Chargeback.report_cb_model(model)

    # Users (owner list)
    users = Rbac::Filterer.filtered(User.in_my_region)
                          .to_h { |u| [u.userid, u.name] }

    # Tenants
    tenants = Rbac::Filterer.filtered(Tenant.in_my_region)
                            .to_h { |t| [t.id.to_s, t.name] }

    # Tag categories with their entries (so React can populate tag values without
    # a second request when the user selects a category).
    categories = Classification.categories.select { |c| c.show && !c.entries.empty? }
    cats = categories.to_h { |c| [c.name, c.description] }
    tag_values = categories.to_h do |cat|
      [cat.name, cat.entries.map { |e| [e.name, e.description] }]
    end

    # Container providers (for entity filter)
    container_providers = Rbac::Filterer.filtered(ManageIQ::Providers::ContainerManager)
                                        .pluck(:name, :id)
                                        .map { |name, id| [name, id.to_s] }

    # Image labels (for GroupBy = label)
    image_labels = CustomAttribute.where(:section => "docker_labels")
                                  .distinct("name")
                                  .pluck(:name)

    # Timezones
    timezones = ActiveSupport::TimeZone.all.map { |tz| ["(GMT#{tz.formatted_offset}) #{tz.name}", tz.name] }

    render :json => {
      :users               => users,
      :tenants             => tenants,
      :categories          => cats,
      :tag_values          => tag_values,
      :container_providers => container_providers,
      :image_labels        => image_labels,
      :timezones           => timezones,
      :cb_model            => cb_model
    }
  end

  # GET /report/chargeback_entities?provider_id=123&model=ChargebackContainerProject
  # Returns the list of entities (projects or images) for a given container provider.
  def chargeback_entities
    assert_privileges(*EDITOR_FEATURES)
    provider_id = params[:provider_id].to_s.strip
    model = params[:model].to_s.strip

    if provider_id.blank? || model.blank?
      render :json => {:entities => []}
      return
    end

    # Only providers the user is allowed to see
    visible_provider = Rbac::Filterer.filtered(ManageIQ::Providers::ContainerManager.where(:id => provider_id)).first
    # The report model (e.g. ChargebackContainerProject) names the entity the helper looks up (ContainerProject)
    entities = visible_provider ? cb_entities_by_provider_id(visible_provider.id, model.sub(/\A(Chargeback|Metering)/, "")) : []
    render :json => {:entities => Array(entities).map { |name, id| [name, id.to_s] }}
  end

  private

  # Get string with unavailable fields while adding/editing report
  def unavailable_fields_for_model(model)
    case model
    when 'ChargebackVm'
      _('* Caution: CPU Cores Allocated Metric, CPU Cores Used Metric are not supported for Chargeback for Vms.')
    when 'ChargebackContainerImage'
      _('* Caution: CPU Allocated Metric, CPU Used Metric, Disk I/O Used Metric, Fixed Storage Metric, Storage Allocated Metric, Storage Used Metric are not supported for Chargeback for Images.')
    when 'ChargebackContainerProject'
      _('* Caution: CPU Allocated Metric, CPU Used Metric, CPU Cores Allocated Metric, Disk I/O Used Metric, Memory Allocated Metric, Fixed Storage Metric, Storage Allocated Metric, Storage Used Metric are not supported for Chargeback for Projects.')
    end
  end

  # Columns, column keys and rows of a generated report, as the editor's preview table needs them.
  def preview_payload(rpt)
    col_keys = Array(rpt.col_order)
    headers = Array(rpt.headers)
    # Pad labels to match col_order length in case headers is shorter
    col_labels = col_keys.each_with_index.map { |col, i| headers[i].presence || col }
    rows = (rpt.table&.data || []).map do |rec|
      col_keys.map { |col| rec.data[col].to_s }
    end

    {:columns => col_labels, :col_keys => col_keys, :rows => rows}
  end

  def render_report_editor
    @in_a_form = true
    render :action => "editor"
  end

  def reportable_models
    MiqReport.reportable_models.map do |m|
      [Dictionary.gettext(m, :type => :model, :notfound => :titleize, :plural => true), m]
    end
  end

  def report_data_param
    report_data = params[:report_data]
    report_data if report_data.kind_of?(ActionController::Parameters) || report_data.kind_of?(Hash)
  end

  def render_missing_report_data
    render :json => {:success => false, :message => _("Missing report_data parameter")}, :status => 422
  end

  def render_default_report_error
    render :json => {:success => false, :message => _('Default reports can not be edited')}, :status => 422
  end

  # Report type the editor tab set depends on: standard, performance, trend or chargeback.
  # Metering models inherit from Chargeback, so they are chargeback reports as well.
  def report_type_for_model(model)
    if model == ApplicationController::TREND_MODEL
      "trend"
    elsif model.to_s.ends_with?("Performance", "MetricsRollup")
      "performance"
    elsif chargeback_report_model?(model)
      "chargeback"
    else
      "standard"
    end
  end

  # Build the queue timeout options list used by the React form.
  # The system default entry names the actual default so users can see what they get.
  def queue_timeout_options
    default_label = "<#{_('System Default')} (#{helpers.distance_of_time_in_words(MiqReport.default_queue_timeout)})>"
    options = [[default_label, nil]]
    (1..6).each { |n| options << [n_("%{count} Hour", "%{count} Hours", n) % {:count => n}, n.hours.to_i] }
    options
  end
end

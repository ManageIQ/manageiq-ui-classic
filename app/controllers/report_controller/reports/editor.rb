module ReportController::Reports::Editor
  extend ActiveSupport::Concern

  included do
    helper_method :chargeback_allocated_methods, :chargeback_allocated_methods
  end

  DEFAULT_PDF_PAGE_SIZE = "US-Letter".freeze

  # Strip the "Model-" prefix that the React field picker stores on field IDs
  # (e.g. "AuditEvent-created_on" -> "created_on").  MiqReport#generate_table
  # expects bare field names, exactly as the legacy HAML editor produced with
  # field.split("-")[1].
  def strip_field_prefix(field)
    idx = field.index("-")
    idx ? field[(idx + 1)..] : field
  end
  private :strip_field_prefix

  # Normalize a column format value coming from the React UI.
  # "_none_" and "" both mean "no format" (nil); anything else is kept as-is.
  def normalize_col_format(val)
    return nil if val.blank? || val.to_s == "_none_"

    val.to_s
  end
  private :normalize_col_format

  MAX_REPORT_COLUMNS = 100 # Default maximum number of columns in a report

  CHAREGEBACK_ALLOCATED_METHODS = {
    :max => N_('Maximum'),
    :avg => N_('Average')
  }.freeze

  def self.chart_top_values
    ::Settings.reporting.chart_top_values
  end

  def chargeback_allocated_methods
    CHAREGEBACK_ALLOCATED_METHODS.map { |k, v| [k, _(v)] }.to_h
  end

  def default_chargeback_allocated_method
    chargeback_allocated_methods.keys.first
  end

  def miq_report_new
    assert_privileges("miq_report_new")
    @_params.delete(:id) # incase add button was pressed from report show screen.
    javascript_redirect(:controller => "report", :action => "react_edit", :id => "new")
  end

  def miq_report_copy
    assert_privileges("miq_report_copy")
    javascript_redirect(:controller => "report", :action => "react_edit", :id => "new", :copy_from => params[:id])
  end

  def miq_report_edit
    assert_privileges(params[:id] ? "miq_report_edit" : "miq_report_new")
    javascript_redirect(:controller => "report", :action => "react_edit", :id => params[:id] || "new")
  end

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

  # GET /report/react_edit(/:id)
  # Renders the React-based report editor page.
  def react_edit
    if params[:id] && params[:id] != "new"
      assert_privileges("miq_report_edit")
      rpt = find_record_with_rbac(MiqReport, params[:id])
      @record_id = rpt.id.to_s
    else
      assert_privileges("miq_report_new")
      @record_id = "new"
    end
    # copy_from is forwarded as a query param so react_form_data can pre-populate
    # the form with the source report's attributes (mirrors miq_report_copy behaviour).
    @copy_from = params[:copy_from]
    render :action => "react_edit", :layout => "application"
  end

  # GET /report/react_form_data(/:id)
  # Returns all data needed to populate the React report builder wizard.
  # When id is "new" and copy_from is supplied, pre-populate from the source report.
  def react_form_data
    if params[:id] && params[:id] != "new"
      assert_privileges("miq_report_edit")
      rpt = find_record_with_rbac(MiqReport, params[:id])
      report_attrs = serialize_report_attrs(rpt)
      report_type = react_report_type(rpt.db)
    elsif params[:copy_from].present?
      assert_privileges("miq_report_new")
      source = find_record_with_rbac(MiqReport, params[:copy_from])
      report_attrs = serialize_report_attrs(source).merge(:record_id => nil)
      report_type = react_report_type(source.db)
      # Clear identity fields so the user saves a new report, not overwrites the source
      report_attrs[:name]  = ""
      report_attrs[:title] = ""
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
        :db_options    => {},
      }
      report_type = "standard"
    end

    # rpt is set when loading an existing report; for copy-from use the already-fetched source.
    rpt ||= source

    # Build per-field metadata for existing/copy-source reports so SummaryTab / StylingTab
    # have numeric/format/suffix data without waiting for the FieldPicker fetch.
    field_metadata = {}
    if rpt.present? && rpt.db.present? && rpt.col_order.present?
      Array(rpt.col_order).each do |bare_col|
        field_id = "#{rpt.db}-#{bare_col}"
        ci = MiqReport.get_col_info(bare_col)
        fmt_sub = ci[:format_sub_type]
        units = MiqExpression::FORMAT_SUB_TYPES.dig(fmt_sub, :units)
        field_metadata[field_id] = {
          :numeric         => ci[:numeric],
          :data_type       => ci[:data_type]&.to_s,
          :format_sub_type => fmt_sub&.to_s,
          :break_suffixes  => MiqReport.get_col_break_suffixes(bare_col).map { |label, val| [_(label.to_s), val.to_s] },
          :available_formats => (ci[:available_formats] || {}).invert.sort_by { |label, _| label }.map { |label, sym| [_(label), sym.to_s] },
          :units           => units ? units.map { |u| [_(u.to_s), u.to_s] } : nil,
        }.compact
      end
    end

    render :json => {
      :report                 => report_attrs,
      :report_type            => report_type,
      :models                 => reportable_models,
      :chart_types            => ManageIQ::Reporting::Charting.chart_names_for_select,
      :pdf_page_sizes         => ViewHelper::PDF_PAGE_SIZES.map { |k, v| [_(v), k] },
      :style_classes          => ReportHelper::STYLE_CLASSES.transform_values { |v| _(v) },
      :queue_timeout_options  => react_queue_timeout_options,
      :field_metadata         => field_metadata,
      :unavailable_fields_warning => rpt.present? ? unavailable_fields_for_model(rpt.db) : nil,
    }
  end

  # GET /report/react_available_fields?model=SomModel[&perf_interval=daily]
  # Returns the list of reportable fields for a given model.
  # perf_interval is used for trend/performance models (daily or hourly).
  def react_available_fields
    assert_privileges("miq_report_new")
    model = params[:model].to_s.strip
    if model.blank? || MiqReport.reportable_models.exclude?(model)
      render :json => {:error => _("Invalid or missing model")}, :status => 422
      return
    end
    perf_interval = params[:perf_interval].presence
    fields = perf_interval ? MiqExpression.reporting_available_fields(model, perf_interval) : MiqExpression.reporting_available_fields(model)
    # Use MiqReport.get_col_info[:available_formats] — same source as the legacy HAML
    # _form_formatting.html.haml which used ci[:available_formats].invert.sort_by(&:first).
    # Strip any pivot "__calc" suffix before lookup (e.g. "Vm-col__avg" → "Vm-col").
    field_metadata = fields.each_with_object({}) do |(_, field_id), h|
      bare_id = field_id.split("__").first
      ci = MiqReport.get_col_info(bare_id)
      fmt_sub = ci[:format_sub_type]
      units = MiqExpression::FORMAT_SUB_TYPES.dig(fmt_sub, :units)
      sorted_fmts = ci[:available_formats].blank? ? [] : ci[:available_formats].invert.sort_by { |label, _| label }.map { |label, sym| [_(label), sym.to_s] }
      h[field_id] = {
        :numeric           => ci[:numeric],
        :data_type         => ci[:data_type]&.to_s,
        :format_sub_type   => fmt_sub&.to_s,
        :break_suffixes    => MiqReport.get_col_break_suffixes(bare_id).map { |label, val| [_(label.to_s), val.to_s] },
        :available_formats => sorted_fmts,
        :default_format    => ci[:default_format]&.to_s,
        :units             => units ? units.map { |u| [_(u.to_s), u.to_s] } : nil,
      }.compact
    end
    render :json => {:fields => fields, :field_metadata => field_metadata}
  end

  # POST /report/react_save(/:id)
  # Saves (create or update) a report from a JSON body.
  def react_save
    id = params[:id]
    if id && id != "new"
      assert_privileges("miq_report_edit")
      rpt = find_record_with_rbac(MiqReport, id)
    else
      assert_privileges("miq_report_new")
      rpt = MiqReport.new
    end

    report_data = params[:report_data]
    unless report_data.kind_of?(ActionController::Parameters) || report_data.kind_of?(Hash)
      render :json => {:success => false, :message => _("Missing report_data parameter")}, :status => 422
      return
    end

    rpt.template_type = "report"
    rpt.name          = report_data[:name].to_s.strip
    rpt.title         = report_data[:title].to_s.strip
    # The DDF Carbon SELECT stores {value:, label:} objects (simpleValue: false),
    # so model may arrive as either a plain string or a nested params hash.
    model_param = report_data[:model]
    rpt.db = (model_param.respond_to?(:to_unsafe_h) ? model_param.to_unsafe_h['value'] : model_param).to_s.presence
    raw_col_order     = Array(report_data[:col_order])
    rpt.col_order     = raw_col_order.map { |f| strip_field_prefix(f) }
    rpt.headers       = Array(report_data[:headers])
    rpt.col_formats   = Array(report_data[:col_formats]).map { |f| normalize_col_format(f) }
    raw_col_options   = report_data[:col_options].respond_to?(:to_unsafe_h) ? report_data[:col_options].to_unsafe_h : (report_data[:col_options] || {}).to_h
    rpt.col_options   = raw_col_options
                          .transform_keys { |k| strip_field_prefix(k.to_s).to_sym }
                          .transform_values { |v| v.is_a?(Hash) ? v.deep_symbolize_keys : v }
    raw_sortby = report_data[:sortby].present? ? Array(report_data[:sortby]).map { |f| strip_field_prefix(f) } : nil
    # Merge sort suffixes (e.g. "week") back into sortby entries — the HAML stored
    # them appended with "__" (e.g. "created_on__week").  The React UI tracks them
    # separately to keep the base field value unambiguous in the dropdown.
    if raw_sortby.present?
      s1_suffix = report_data[:sort1_suffix].to_s.presence
      s2_suffix = report_data[:sort2_suffix].to_s.presence
      raw_sortby[0] = "#{raw_sortby[0]}__#{s1_suffix}" if s1_suffix && raw_sortby[0]
      raw_sortby[1] = "#{raw_sortby[1]}__#{s2_suffix}" if s2_suffix && raw_sortby[1]
    end
    rpt.sortby        = raw_sortby
    rpt.order         = report_data[:order].presence
    rpt.group         = report_data[:group].presence
    rpt.tz            = report_data[:tz].presence
    rpt.rpt_group   ||= "Custom"
    rpt.rpt_type    ||= "Custom"
    rpt.user          = current_user
    rpt.miq_group     = current_user.current_group

    # Chart
    if report_data[:graph_type].present?
      rpt.graph = {
        :type   => report_data[:graph_type].to_s,
        :count  => report_data[:graph_count].present? ? report_data[:graph_count].to_i : nil,
        :other  => report_data[:graph_other],
        :mode   => report_data[:graph_mode].to_s.presence,
        :column => report_data[:graph_column].to_s.presence,
      }.compact
    end

    # db_options (performance / trend / chargeback)
    db_options = {}
    if report_data[:perf_interval].present?
      db_options[:interval]      = report_data[:perf_interval]
      db_options[:calc_avgs_by]  = report_data[:perf_avgs].presence || "time_interval"
      db_options[:end_offset]    = report_data[:perf_end].to_i   if report_data[:perf_end].present?
      db_options[:start_offset]  = report_data[:perf_start].to_i if report_data[:perf_start].present?
      # Trend-specific fields
      if report_data[:trend_col].present?
        trend_col_id = report_data[:trend_col].to_s      # "VmPerformance-cpu_usage_rate_average"
        trend_db, trend_col = trend_col_id.split("-", 2)
        db_options[:rpt_type]     = "trend"
        db_options[:trend_db]     = trend_db
        db_options[:trend_col]    = trend_col
        db_options[:limit_col]    = report_data[:trend_limit_col].presence
        db_options[:limit_val]    = report_data[:trend_limit_val].presence
        target_pcts = [
          report_data[:trend_pct1].present? ? report_data[:trend_pct1].to_i : 100,
          report_data[:trend_pct2].present? ? report_data[:trend_pct2].to_i : nil,
          report_data[:trend_pct3].present? ? report_data[:trend_pct3].to_i : nil,
        ].compact
        db_options[:target_pcts]  = target_pcts
      end
    end
    if report_data[:cb_show_typ].present?
      cb_opts = {}
      case report_data[:cb_show_typ].to_s
      when "owner"
        cb_opts[:owner] = report_data[:cb_owner_id].to_s.presence
      when "tenant"
        cb_opts[:tenant_id] = report_data[:cb_tenant_id].to_i
      when "tag"
        # cb_tag_value may be an array (multi-select) or a single string
        tag_value = report_data[:cb_tag_value]
        tag_value = Array(tag_value).map(&:to_s) if tag_value.is_a?(Array)
        cb_opts[:tag] = [report_data[:cb_tag_cat].to_s, tag_value]
      when "entity"
        cb_opts[:provider_id] = report_data[:cb_provider_id].to_s.presence
        cb_opts[:entity_id]   = report_data[:cb_entity_id].to_s.presence
      end
      cb_opts[:groupby]     = report_data[:cb_groupby].to_s.presence
      # groupby_tag may be an array (multi-select) or single string
      groupby_tag = report_data[:cb_groupby_tag]
      cb_opts[:groupby_tag] = groupby_tag.is_a?(Array) ? Array(groupby_tag).map(&:to_s) : groupby_tag.to_s.presence
      cb_opts[:groupby_label]         = report_data[:cb_groupby_label].to_s.presence
      cb_opts[:interval]              = report_data[:cb_interval].to_s.presence
      cb_opts[:interval_size]         = report_data[:cb_interval_size].to_i if report_data[:cb_interval_size].present?
      cb_opts[:end_interval_offset]   = report_data[:cb_end_interval_offset].to_i if report_data[:cb_end_interval_offset].present?
      cb_opts[:include_metrics]       = report_data[:cb_include_metrics]
      cb_opts[:method_for_allocated_metrics] = report_data[:method_for_allocated_metrics].to_s.presence
      cb_opts[:cumulative_rate_calculation]  = report_data[:cumulative_rate_calculation]
      cb_opts[:tz]                    = report_data[:tz].to_s.presence
      db_options[:options]            = cb_opts.compact
    end
    rpt.db_options = db_options if db_options.present?

    # Filters — arrive as MiqExpression hashes (converted from RQB on the JS side).
    # A null/blank value or a hash containing only "???" means no filter.
    record_filter = report_data[:record_filter]
    rpt.conditions = if record_filter.present?
                       raw = record_filter.respond_to?(:to_unsafe_h) ? record_filter.to_unsafe_h : record_filter.to_h
                       raw = raw.deep_stringify_keys
                       raw["???"].blank? ? MiqExpression.new(raw) : nil
                     end

    display_filter = report_data[:display_filter]
    rpt.display_filter = if display_filter.present?
                           raw = display_filter.respond_to?(:to_unsafe_h) ? display_filter.to_unsafe_h : display_filter.to_h
                           raw = raw.deep_stringify_keys
                           raw["???"].blank? ? MiqExpression.new(raw) : nil
                         end

    # A chart type requires a sort field — validate before any further mutation.
    if report_data[:graph_type].present? && rpt.sortby.blank?
      render :json => {:success => false, :message => _("A sort field is required when a chart type is configured")}, :status => 422
      return
    end

    # Persist break_format into col_options on the primary sort column.
    # The HAML stored it as col_options[sortby1_col][:break_format].
    if report_data[:break_format].present? && rpt.sortby.present?
      sort_col = rpt.sortby.first.split("__").first  # strip any appended suffix
      rpt.col_options = (rpt.col_options || {}).merge(
        sort_col.to_sym => ((rpt.col_options || {})[sort_col.to_sym] || {}).merge(:break_format => report_data[:break_format].to_s)
      )
    end

    raw_rpt_options = report_data[:rpt_options] || {}
    rpt_options = raw_rpt_options.respond_to?(:to_unsafe_h) ? raw_rpt_options.to_unsafe_h : raw_rpt_options.to_h
    rpt_options = rpt_options.deep_symbolize_keys
    rpt_options[:pdf]               ||= {}
    rpt_options[:pdf][:page_size]     = report_data[:pdf_page_size].presence || DEFAULT_PDF_PAGE_SIZE
    rpt_options[:queue_timeout]       = report_data[:queue_timeout].present? ? report_data[:queue_timeout].to_i : nil
    rpt_options[:row_limit]           = report_data[:row_limit].present? ? report_data[:row_limit].to_i : nil
    rpt_options[:summary]           ||= {}
    rpt_options[:summary][:hide_detail_rows] = report_data[:hide_details] == true || report_data[:hide_details] == "true"
    rpt.rpt_options = rpt_options

    unless rpt.valid?
      messages = rpt.errors.full_messages.join(", ")
      render :json => {:success => false, :message => messages}, :status => 422
      return
    end

    if rpt.save
      populate_reports_menu
      render :json => {:success => true, :message => _("Report was saved"), :id => rpt.id}
    else
      messages = rpt.errors.full_messages.join(", ")
      render :json => {:success => false, :message => messages}, :status => 422
    end
  end

  # POST /report/react_preview
  # Builds a temporary MiqReport from the posted report_data, runs generate_table
  # synchronously with a 100-row limit, and returns { columns:, rows: } as JSON.
  # Nothing is persisted.
  def react_preview
    assert_privileges("miq_report_new")

    report_data = params[:report_data]
    unless report_data.kind_of?(ActionController::Parameters) || report_data.kind_of?(Hash)
      render :json => {:success => false, :message => _("Missing report_data parameter")}, :status => 422
      return
    end

    col_order = Array(report_data[:col_order])
    if col_order.blank?
      render :json => {:columns => [], :rows => []}
      return
    end

    rpt = MiqReport.new
    rpt.template_type = "report"
    rpt.name          = report_data[:name].to_s.presence || "Preview"
    rpt.title         = report_data[:title].to_s.presence || "Preview"
    rpt.db            = report_data[:model].to_s.presence
    rpt.col_order     = col_order.map { |f| strip_field_prefix(f) }
    rpt.headers       = Array(report_data[:headers])
    rpt.col_formats   = Array(report_data[:col_formats]).map { |f| normalize_col_format(f) }
    raw_col_options   = (report_data[:col_options] || {}).to_unsafe_h
    rpt.col_options   = raw_col_options
                          .transform_keys { |k| strip_field_prefix(k.to_s).to_sym }
                          .transform_values { |v| v.is_a?(Hash) ? v.deep_symbolize_keys : v }
    rpt.sortby        = report_data[:sortby].present? ? Array(report_data[:sortby]).map { |f| strip_field_prefix(f) } : nil
    rpt.order         = report_data[:order].presence
    rpt.group         = report_data[:group].presence
    rpt.tz            = report_data[:tz].presence
    rpt.rpt_group     = "Custom"
    rpt.rpt_type      = "Custom"
    rpt.user          = current_user
    rpt.miq_group     = current_user.current_group

    begin
      rpt.generate_table(:userid => session[:userid], :limit => 100)
    rescue => e
      render :json => {:success => false, :message => e.message}, :status => 422
      return
    end

    col_keys = Array(rpt.col_order)
    col_labels = Array(rpt.headers)
    # Pad labels to match col_order length in case headers is shorter
    col_labels = col_keys.each_with_index.map { |col, i| col_labels[i].presence || col }
    rows = (rpt.table&.data || []).map do |rec|
      col_keys.map { |col| rec.data[col].to_s }
    end

    render :json => {:columns => col_labels, :col_keys => col_keys, :rows => rows}
  end

  # GET /report/react_trend_limit_cols?trend_col=VmPerformance-cpu_usagemhz_rate_average&perf_interval=daily
  # Returns the limit column choices for a given trend column selection.
  def react_trend_limit_cols
    assert_privileges("miq_report_new")
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

  # GET /report/react_chargeback_options?model=ChargebackVm
  # Returns option lists needed to render the chargeback filter tab.
  def react_chargeback_options
    assert_privileges("miq_report_new")

    model = params[:model].to_s.strip
    unless Chargeback.db_is_chargeback?(model)
      render :json => {:error => _("Invalid or non-chargeback model")}, :status => 422
      return
    end

    cb_model = Chargeback.report_cb_model(model)

    # Users (owner list)
    users = Rbac::Filterer.filtered(User.in_my_region)
                          .each_with_object({}) { |u, h| h[u.userid] = u.name }

    # Tenants
    tenants = Rbac::Filterer.filtered(Tenant.in_my_region)
                            .each_with_object({}) { |t, h| h[t.id.to_s] = t.name }

    # Tag categories with their entries (so React can populate tag values without
    # a second request when the user selects a category).
    cats = Classification.categories
                         .select { |c| c.show && !c.entries.empty? }
                         .each_with_object({}) { |c, h| h[c.name] = c.description }

    tag_values = Classification.categories
                               .select { |c| c.show && !c.entries.empty? }
                               .each_with_object({}) do |cat, h|
                                 h[cat.name] = cat.entries.map { |e| [e.name, e.description] }
                               end

    # Container providers (for entity filter)
    container_providers = ManageIQ::Providers::ContainerManager.pluck(:name, :id)
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
      :cb_model            => cb_model,
    }
  end

  # GET /report/react_chargeback_entities?provider_id=123&model=ChargebackContainerProject
  # Returns the list of entities (projects or images) for a given container provider.
  def react_chargeback_entities
    assert_privileges("miq_report_new")
    provider_id = params[:provider_id].to_s.strip
    model = params[:model].to_s.strip

    if provider_id.blank? || model.blank?
      render :json => {:entities => []}
      return
    end

    entities = cb_entities_by_provider_id(provider_id, model) || []
    render :json => {:entities => entities.map { |name, id| [name, id.to_s] }}
  end

  private

  def reportable_models
    MiqReport.reportable_models.collect do |m|
      [Dictionary.gettext(m, :type => :model, :notfound => :titleize, :plural => true), m]
    end
  end

  # Serialise a MiqReport into the attribute hash the React form expects.
  def serialize_report_attrs(rpt)
    graph = rpt.graph.kind_of?(Hash) ? rpt.graph : {}
    rpt_options = rpt.rpt_options.kind_of?(Hash) ? rpt.rpt_options : {}
    db_opts = rpt.db_options.kind_of?(Hash) ? rpt.db_options : {}

    # Re-apply the "Model-" prefix the React field picker expects.
    prefixed_col_order = Array(rpt.col_order).map { |f| "#{rpt.db}-#{f}" }
    prefixed_sortby = Array(rpt.sortby).map do |f|
      base, suffix = f.split("__", 2)
      prefixed = "#{rpt.db}-#{base}"
      suffix ? "#{prefixed}__#{suffix}" : prefixed
    end
    prefixed_col_options = (rpt.col_options || {}).transform_keys { |k| "#{rpt.db}-#{k}" }

    record_filter  = rpt.conditions.kind_of?(MiqExpression) ? rpt.conditions.exp : nil
    display_filter = rpt.display_filter.kind_of?(MiqExpression) ? rpt.display_filter.exp : nil

    {
      :name          => rpt.name,
      :title         => rpt.title,
      :model         => rpt.db,
      :record_id     => rpt.id,
      :col_order     => prefixed_col_order,
      :headers       => rpt.headers,
      :col_formats   => rpt.col_formats,
      :col_options   => prefixed_col_options,
      :sortby        => prefixed_sortby,
      :order         => rpt.order,
      :group         => rpt.group,
      :hide_details  => rpt_options.dig(:summary, :hide_detail_rows) || false,
      :row_limit     => rpt_options.dig(:row_limit),
      :graph_type    => graph[:type],
      :graph_count   => graph[:count],
      :graph_other   => graph[:other],
      :graph_mode    => graph[:mode],
      :graph_column  => graph[:column],
      :pdf_page_size => rpt_options.dig(:pdf, :page_size) || DEFAULT_PDF_PAGE_SIZE,
      :queue_timeout => rpt_options[:queue_timeout],
      :db_options    => db_opts,
      :record_filter  => record_filter,
      :display_filter => display_filter,
      :trend_col       => db_opts[:trend_db].present? ? "#{db_opts[:trend_db]}-#{db_opts[:trend_col]}" : nil,
      :trend_limit_col => db_opts[:limit_col],
      :trend_limit_val => db_opts[:limit_val]&.to_s,
      :trend_pct1      => db_opts[:target_pcts]&.dig(0),
      :trend_pct2      => db_opts[:target_pcts]&.dig(1),
      :trend_pct3      => db_opts[:target_pcts]&.dig(2),
    }
  end
  private :serialize_report_attrs

  # Derive a human-readable report type string from the model name.
  def react_report_type(model)
    case model_report_type(model)
    when :performance then "performance"
    when :trend       then "trend"
    when NilClass     then "standard"
    else                   "chargeback"
    end
  end

  # Build the queue timeout options list used by the React form.
  def react_queue_timeout_options
    options = [[_("(Use System Default)"), nil]]
    (1..6).each { |n| options << [n_("%{count} Hour", "%{count} Hours", n) % {:count => n}, n.hours.to_i] }
    options
  end
end

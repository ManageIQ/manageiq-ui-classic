# Translates between the JSON the React report editor works with and the
# MiqReport attributes the core report generator consumes.
#
# The editor identifies every column by a field id ("Vm-name", "Vm.host-name",
# "Vm.managed-environment"), while a MiqReport stores:
#   * main table columns in `cols` / `col_order` ("name")
#   * related table columns as dotted `col_order` entries ("host.name") plus a
#     nested `include` hash
#   * summary, pivot and chart settings in `group`, `sortby`, `dims`, `graph`
#     and `rpt_options`
#   * performance, trend and chargeback settings in `db_options`
#
# `assign_report_attributes` maps editor -> MiqReport and `serialize_report_attrs`
# is its inverse.
module ReportController::Reports::EditorMapping
  extend ActiveSupport::Concern

  private

  # ---------------------------------------------------------------------------
  # Editor -> MiqReport
  # ---------------------------------------------------------------------------

  def assign_report_attributes(rpt, report_data)
    db = report_model_from(report_data)
    report_type = react_report_type(db)

    rpt.template_type = "report"
    rpt.name          = report_data[:name].to_s.strip
    rpt.title         = report_data[:title].to_s.strip
    rpt.db            = db
    rpt.rpt_group   ||= "Custom"
    rpt.rpt_type    ||= "Custom"
    rpt.user          = current_user
    rpt.miq_group     = current_user.current_group
    rpt.tz            = report_data[:tz].presence

    rpt.cols = []
    rpt.col_order = []
    rpt.headers = []
    rpt.col_formats = []
    rpt.include = {}
    rpt.sortby = nil
    rpt.order = nil
    rpt.group = nil
    rpt.dims = nil
    rpt.graph = nil
    rpt.db_options = {}

    case report_type
    when "performance", "trend" then assign_performance_options(rpt, report_data, report_type)
    when "chargeback"           then assign_chargeback_options(rpt, report_data)
    end

    # Trend reports cannot be sorted by the user
    if report_type == "trend"
      rpt.sortby = ["resource_name"]
      rpt.order = "Ascending"
    end

    col_for_field = assign_columns(rpt, report_data)

    unless %w[trend chargeback].include?(report_type)
      assign_sorting_and_chart(rpt, report_data, col_for_field)
      assign_col_options(rpt, report_data, col_for_field)
    end

    rpt.conditions     = expression_from(report_data[:record_filter])
    rpt.display_filter = expression_from(report_data[:display_filter])

    assign_rpt_options(rpt, report_data, col_for_field)
    rpt.add_includes_for_virtual_custom_attributes
  end

  # The DDF Carbon SELECT stores {value:, label:} objects (simpleValue: false),
  # so model may arrive as either a plain string or a nested hash.
  def report_model_from(report_data)
    model = report_data[:model]
    model = model.to_unsafe_h if model.respond_to?(:to_unsafe_h)
    model = model["value"] || model[:value] if model.kind_of?(Hash)
    model.to_s.presence
  end

  def assign_performance_options(rpt, report_data, report_type)
    end_offset = report_data[:perf_end].to_i
    options = rpt.db_options
    options[:interval]     = report_data[:perf_interval].presence || "daily"
    options[:end_offset]   = end_offset
    # The editor sends the start relative to the end; core stores it absolute.
    options[:start_offset] = end_offset + report_data[:perf_start].to_i

    if report_type == "performance"
      options[:calc_avgs_by] = report_data[:perf_avgs].presence || "time_interval"
      return
    end

    trend_db, trend_col = report_data[:trend_col].to_s.split("-", 2)
    options[:rpt_type]  = "trend"
    options[:trend_db]  = trend_db
    options[:trend_col] = trend_col
    options[:limit_col] = report_data[:trend_limit_col] if report_data[:trend_limit_col].present?
    options[:limit_val] = report_data[:trend_limit_val] if report_data[:trend_limit_val].present?
    options[:target_pcts] = [
      report_data[:trend_pct1].presence&.to_i || 100,
      report_data[:trend_pct2].presence&.to_i,
      report_data[:trend_pct3].presence&.to_i
    ].compact
  end

  def assign_chargeback_options(rpt, report_data)
    rpt.db_options[:rpt_type] = rpt.db

    groupby = report_data[:cb_groupby].to_s.presence
    groupby_tag = groupby == "tag" ? string_list(report_data[:cb_groupby_tag]) : nil
    groupby_label = groupby == "label" ? report_data[:cb_groupby_label].to_s.presence : nil

    options = {
      :interval                     => report_data[:cb_interval].to_s.presence,
      :interval_size                => report_data[:cb_interval_size].presence&.to_i,
      :end_interval_offset          => report_data[:cb_end_interval_offset].presence&.to_i,
      :method_for_allocated_metrics => report_data[:method_for_allocated_metrics].presence&.to_sym,
      :include_metrics              => cast_boolean(report_data[:cb_include_metrics]),
      :cumulative_rate_calculation  => cast_boolean(report_data[:cumulative_rate_calculation]),
      :groupby                      => groupby,
      :groupby_tag                  => groupby_tag,
      :groupby_label                => groupby_label
    }
    options.merge!(chargeback_filter_options(report_data))
    rpt.db_options[:options] = options.compact

    tag_header = groupby_tag.present? ? Classification.lookup_by_name(groupby_tag.first)&.description : nil
    rpt.db.constantize.set_chargeback_report_options(rpt, groupby, tag_header, groupby_label, report_data[:tz].presence)
  end

  def chargeback_filter_options(report_data)
    case report_data[:cb_show_typ].to_s
    when "owner"
      {:owner => report_data[:cb_owner_id].to_s.presence}
    when "tenant"
      {:tenant_id => report_data[:cb_tenant_id].presence&.to_i}
    when "tag"
      category = report_data[:cb_tag_cat].to_s.presence
      values = string_list(report_data[:cb_tag_value])
      # Core stores each tag as its full path
      {:tag => category && values.present? ? parse_tag_categories(category, values) : nil}
    when "entity"
      {:provider_id => report_data[:cb_provider_id].to_s.presence, :entity_id => report_data[:cb_entity_id].to_s.presence}
    else
      {}
    end
  end

  def assign_columns(rpt, report_data)
    field_ids = Array(report_data[:col_order]).map(&:to_s)
    headers = Array(report_data[:headers])
    formats = Array(report_data[:col_formats])

    pivot_fields = pivot_group_fields(report_data)
    calcs_by_field = pivot_fields.empty? ? {} : pivot_calcs_by_field(report_data).except(*pivot_fields)

    field_ids.each_with_index.with_object({}) do |(field_id, idx), col_for_field|
      tables, column = split_field_id(field_id, rpt.db)
      header = headers[idx].to_s
      format = normalize_col_format(formats[idx])
      calcs = calcs_by_field[field_id].to_a

      if calcs.empty?
        add_report_column(rpt, tables, column, header, format)
      else
        calcs.each do |calc|
          add_report_column(rpt, tables, column, "#{header} (#{calc.titleize})", format, calc)
        end
      end
      col_for_field[field_id] = (tables + [column]).join(".")
    end
  end

  # "Vm.host-name" => [["host"], "name"]. Custom attribute columns always live on
  # the main table, even if their id contains a dot.
  def split_field_id(field_id, model)
    path, column = field_id.include?("-") ? field_id.split("-", 2) : [model.to_s, field_id]
    tables = column.start_with?(CustomAttributeMixin::CUSTOM_ATTRIBUTES_PREFIX) ? [] : (path.split(".")[1..] || [])
    [tables, column]
  end

  # Appends the column to the report. Related table columns are registered in the
  # nested `include` hash and use a dotted col_order entry ("host.name").
  # Pivot calculation columns are stored as "<col>__<calc>".
  def add_report_column(rpt, tables, column, header, format, calc = nil)
    if tables.empty?
      rpt.cols.push(column) unless rpt.cols.include?(column)
    else
      include_hash = rpt.include
      tables.each_with_index do |table, idx|
        include_hash[table] ||= {}
        if idx == tables.length - 1
          include_hash[table]["columns"] ||= []
          include_hash[table]["columns"].push(column) unless include_hash[table]["columns"].include?(column)
        else
          include_hash[table]["include"] ||= {}
          include_hash = include_hash[table]["include"]
        end
      end
    end

    entry = (tables + [column]).join(".")
    rpt.col_order.push(calc ? "#{entry}__#{calc}" : entry)
    rpt.headers.push(header)
    rpt.col_formats.push(format)
  end

  # "_none_" is a real core format (raw value), blank means the default format.
  def normalize_col_format(value)
    value.presence&.to_sym
  end

  def assign_sorting_and_chart(rpt, report_data, col_for_field)
    sort_fields = Array(report_data[:sortby]).map(&:to_s).first(2)
    suffixes = [report_data[:sort1_suffix], report_data[:sort2_suffix]]

    sortby = []
    sort_fields.each_with_index do |entry, idx|
      field_id, entry_suffix = col_for_field.key?(entry) ? [entry, nil] : entry.split("__", 2)
      col = col_for_field[field_id]
      break unless col # "<<<Nothing>>>" or a column that is no longer selected

      # The editor keeps the break suffix (e.g. "week") apart from the field id;
      # core expects it appended to the sort column as "created_on__week".
      suffix = suffixes[idx].to_s.presence || entry_suffix
      suffix = nil unless suffix && MiqReport.is_break_suffix?(suffix)
      sortby << (suffix ? "#{col}__#{suffix}" : col)
    end

    rpt.sortby = sortby.presence
    rpt.order  = sortby.present? ? report_data[:order].presence || "Ascending" : nil
    rpt.group  = sortby.present? ? {"Yes" => "y", "Counts" => "c"}[report_data[:group].to_s] : nil

    graph_type = report_data[:graph_type].to_s.presence
    return if graph_type.nil? || sortby.empty?

    # Pie and Donut charts are always one dimensional
    rpt.dims = graph_type.match?(/\A(Pie|Donut)/) || sortby.length < 2 ? 1 : 2
    rpt.graph = {
      :type   => graph_type,
      :mode   => report_data[:graph_mode].to_s.presence,
      :column => report_data[:graph_column].to_s.presence,
      :count  => report_data[:graph_count].presence&.to_i,
      :other  => cast_boolean(report_data[:graph_other])
    }.compact
  end

  def assign_col_options(rpt, report_data, col_for_field)
    raw = report_data[:col_options]
    raw = raw.respond_to?(:to_unsafe_h) ? raw.to_unsafe_h : (raw || {}).to_h

    options = {}
    raw.each do |field_id, option|
      col = col_for_field[field_id.to_s]
      next unless col

      cleaned = normalize_col_option(option)
      options[col] = cleaned if cleaned.present?
    end

    # Core looks the summary row format up under the full sort column, suffix included
    break_format = report_data[:break_format].to_s.presence
    options[rpt.sortby.first] = (options[rpt.sortby.first] || {}).merge(:break_format => break_format.to_sym) if break_format && rpt.sortby.present?
    rpt.col_options = options
  end

  # The editor round-trips header and format inside col_options; core keeps those
  # in `headers` / `col_formats`, so only the remaining settings are stored.
  def normalize_col_option(option)
    option = option.to_unsafe_h if option.respond_to?(:to_unsafe_h)
    cleaned = option.to_h.deep_symbolize_keys.except(:header, :format, :break_format)

    grouping = Array(cleaned.delete(:grouping)).map(&:to_sym)
    cleaned[:grouping] = grouping if grouping.present?

    styles = Array(cleaned.delete(:style)).filter_map do |style|
      next if style[:class].blank?

      rule = style.merge(:class => style[:class].to_sym)
      suffix = rule.delete(:value_suffix)
      rule[:value_suffix] = suffix.to_sym if suffix.present?
      rule
    end
    cleaned[:style] = styles if styles.present?
    cleaned
  end

  def expression_from(filter)
    return if filter.blank?

    raw = filter.respond_to?(:to_unsafe_h) ? filter.to_unsafe_h : filter.to_h
    raw = raw.deep_stringify_keys
    # A hash containing only "???" is the empty expression editor placeholder
    MiqExpression.new(raw) if raw["???"].blank?
  end

  def assign_rpt_options(rpt, report_data, col_for_field)
    # Start from the stored options so keys the editor does not manage survive an edit
    options = rpt.rpt_options.kind_of?(Hash) ? rpt.rpt_options.deep_dup : {}

    group_cols = pivot_group_fields(report_data).filter_map { |field_id| col_for_field[field_id] }
    options.delete(:pivot)
    options[:pivot] = {:group_cols => group_cols} if group_cols.present?

    if rpt.group.nil? && report_data[:row_limit].present?
      options[:row_limit] = report_data[:row_limit].to_i
    else
      options.delete(:row_limit)
    end

    options[:pdf] ||= {}
    options[:pdf][:page_size] = report_data[:pdf_page_size].presence || ReportController::Reports::Editor::DEFAULT_PDF_PAGE_SIZE
    options[:queue_timeout] = report_data[:queue_timeout].presence&.to_i

    if rpt.group.nil?
      options.delete(:summary)
    else
      options[:summary] ||= {}
      options[:summary][:hide_detail_rows] = cast_boolean(report_data[:hide_details]) || false
    end

    rpt.rpt_options = options
  end

  # Group-by fields for consolidation, up to three, each requiring the previous
  def pivot_group_fields(report_data)
    values = %i[pivot_by1 pivot_by2 pivot_by3].map { |key| report_data[key].to_s }
    values.take_while { |value| value.present? && value != ReportHelper::NOTHING_STRING }
  end

  # { field id => ["avg", "total"] }, limited to the calculations core knows
  def pivot_calcs_by_field(report_data)
    raw = report_data[:pivot_cols]
    raw = raw.respond_to?(:to_unsafe_h) ? raw.to_unsafe_h : (raw || {}).to_h
    valid = MiqReport::PIVOTS.map { |calc, _| calc.to_s }
    raw.each_with_object({}) { |(field_id, calcs), hash| hash[field_id.to_s] = valid & Array(calcs).map(&:to_s) }
  end

  def string_list(value)
    values = value.kind_of?(String) ? value.split(",") : Array(value)
    values.map { |v| v.to_s.strip }.compact_blank
  end

  def cast_boolean(value)
    ActiveModel::Type::Boolean.new.cast(value)
  end

  def parse_tag_categories(category, tag_values)
    tag_values.map { |tag_value| "/managed/#{category}/#{tag_value}" }
  end

  # ---------------------------------------------------------------------------
  # Validation (mirrors the checks of the legacy editor)
  # ---------------------------------------------------------------------------

  def report_validation_errors(rpt, report_data, report_type)
    errors = []

    if report_type == "trend"
      limit_val = report_data[:trend_limit_val]
      errors << _('Trending for is required') if report_data[:trend_col].blank?
      errors << _('Trend Target Limit must be configured') if report_data[:trend_limit_col].blank? && limit_val.blank?
      errors << _('Trend Target Limit must be numeric') if limit_val.present? && !is_numeric?(limit_val)
    elsif Array(report_data[:col_order]).blank?
      errors << _('At least one Field must be selected')
    end

    errors.concat(chargeback_validation_errors(rpt, report_data)) if report_type == "chargeback"

    if report_data[:graph_type].present?
      errors << _("A sort field is required when a chart type is configured") if rpt.sortby.blank?
      errors << _('Data column must be selected when chart mode is set to "Values"') if report_data[:graph_mode].to_s == "values" && report_data[:graph_column].blank?
    end

    errors.concat(style_validation_errors(rpt))
    errors.concat(rpt.errors.full_messages) unless rpt.valid?
    errors
  end

  def chargeback_validation_errors(rpt, report_data)
    message = case report_data[:cb_show_typ].to_s
              when ""
                _('Show Costs by must be selected')
              when "owner"
                _('An Owner must be selected') if report_data[:cb_owner_id].blank?
              when "tenant"
                _('A Tenant Category must be selected') if report_data[:cb_tenant_id].blank?
              when "tag"
                if report_data[:cb_tag_cat].blank?
                  _('A Tag Category must be selected')
                elsif string_list(report_data[:cb_tag_value]).empty?
                  _('A Tag must be selected')
                end
              when "entity"
                _("A specific %{chargeback} or all must be selected") % {:chargeback => ui_lookup(:model => Chargeback.report_cb_model(rpt.db))} if report_data[:cb_entity_id].blank?
              end

    groupby = report_data[:cb_groupby].to_s
    if groupby == "tag" && string_list(report_data[:cb_groupby_tag]).empty?
      message = _('A Group by Tag must be selected')
    elsif groupby == "label" && report_data[:cb_groupby_label].blank?
      message = _('A Group by Label must be selected')
    elsif groupby == "label" && rpt.cols.any? { |col| col.include?(CustomAttributeMixin::CUSTOM_ATTRIBUTES_PREFIX) }
      message = _('Can not add label columns when grouping by label')
    end
    [message].compact
  end

  def style_validation_errors(rpt)
    (rpt.col_options || {}).flat_map do |col, option|
      Array(option[:style]).each_with_index.filter_map do |style, idx|
        next unless style[:value]

        error = MiqExpression.atom_error(rpt.col_to_expression_col(col.to_s.split("__").first), style[:operator], style[:value])
        next unless error

        position = rpt.col_order.index(col.to_s)
        label = (position && rpt.headers[position]).presence || col
        message = {:item => label, :message => error}
        case idx
        when 0 then _("Styling for '%{item}', first value is in error: %{message}") % message
        when 1 then _("Styling for '%{item}', second value is in error: %{message}") % message
        else        _("Styling for '%{item}', third value is in error: %{message}") % message
        end
      end
    end
  end

  # ---------------------------------------------------------------------------
  # MiqReport -> editor
  # ---------------------------------------------------------------------------

  # Serialise a MiqReport into the attribute hash the React form expects.
  def serialize_report_attrs(rpt)
    graph = rpt.graph.kind_of?(Hash) ? rpt.graph : {}
    rpt_options = rpt.rpt_options.kind_of?(Hash) ? rpt.rpt_options : {}
    db_opts = editor_db_options(rpt)
    columns = editor_columns(rpt)
    col_to_field = columns[:col_to_field]

    sortby = Array(rpt.sortby).filter_map do |entry|
      col, suffix = entry.split("__", 2)
      field_id = col_to_field[col]
      [field_id, MiqReport.is_break_suffix?(suffix) ? suffix : nil] if field_id
    end

    pivot_group_cols = Array(rpt_options.dig(:pivot, :group_cols))
    pivot_by = Array.new(3) { |idx| col_to_field[pivot_group_cols[idx]] || ReportHelper::NOTHING_STRING }

    {
      :name            => rpt.name,
      :title           => rpt.title,
      :model           => rpt.db,
      :record_id       => rpt.id,
      :col_order       => columns[:field_ids],
      :headers         => columns[:headers],
      :col_formats     => columns[:col_formats],
      :col_options     => editor_col_options(rpt, col_to_field),
      :break_format    => editor_break_format(rpt),
      :sortby          => sortby.map(&:first),
      :sort1_suffix    => sortby[0]&.last,
      :sort2_suffix    => sortby[1]&.last,
      :order           => rpt.order.presence || "Ascending",
      :group           => {"y" => "Yes", "c" => "Counts"}.fetch(rpt.group, "No"),
      :hide_details    => rpt_options.dig(:summary, :hide_detail_rows) || false,
      :row_limit       => rpt_options[:row_limit],
      :pivot_by1       => pivot_by[0],
      :pivot_by2       => pivot_by[1],
      :pivot_by3       => pivot_by[2],
      :pivot_cols      => columns[:pivot_cols],
      :graph_type      => graph[:type],
      :graph_count     => graph[:count],
      :graph_other     => graph[:other],
      :graph_mode      => graph[:mode],
      :graph_column    => graph[:column],
      :pdf_page_size   => rpt_options.dig(:pdf, :page_size) || ReportController::Reports::Editor::DEFAULT_PDF_PAGE_SIZE,
      :queue_timeout   => rpt_options[:queue_timeout],
      :tz              => rpt.tz,
      :db_options      => db_opts,
      :perf_start      => editor_perf_start(db_opts),
      :record_filter   => rpt.conditions.kind_of?(MiqExpression) ? rpt.conditions.exp : nil,
      :display_filter  => rpt.display_filter.kind_of?(MiqExpression) ? rpt.display_filter.exp : nil,
      :trend_col       => db_opts[:trend_db].present? ? "#{db_opts[:trend_db]}-#{db_opts[:trend_col]}" : nil,
      :trend_limit_col => db_opts[:limit_col],
      :trend_limit_val => db_opts[:limit_val]&.to_s,
      :trend_pct1      => db_opts[:target_pcts]&.dig(0),
      :trend_pct2      => db_opts[:target_pcts]&.dig(1),
      :trend_pct3      => db_opts[:target_pcts]&.dig(2)
    }
  end

  # Field ids, headers and formats aligned with each other, plus the pivot
  # calculations (stored as "<col>__<calc>" columns) folded back onto their field.
  def editor_columns(rpt)
    chargeback = chargeback_report_model?(rpt.db)
    headers = Array(rpt.headers)
    formats = Array(rpt.col_formats)
    result = {:field_ids => [], :headers => [], :col_formats => [], :pivot_cols => {}, :col_to_field => {}}

    Array(rpt.col_order).each_with_index do |col, idx|
      base, calc = split_pivot_col(col)
      field_id = editor_field_id(rpt, base)
      next if chargeback && !chargeback_editable_field?(field_id)

      header = headers[idx]
      if calc
        result[:pivot_cols][field_id] = ((result[:pivot_cols][field_id] || []) + [calc]).sort
        header = header.to_s.sub(/ \(#{Regexp.escape(calc.titleize)}\)\z/, "")
      end

      result[:col_to_field][base] = field_id
      next if result[:field_ids].include?(field_id)

      result[:field_ids] << field_id
      result[:headers] << header
      result[:col_formats] << formats[idx]&.to_s
    end
    result
  end

  def split_pivot_col(col)
    base, calc = col.to_s.split("__", 2)
    MiqReport::PIVOTS.any? { |name, _| name.to_s == calc } ? [base, calc] : [col.to_s, nil]
  end

  def editor_field_id(rpt, col)
    return "#{rpt.db}-#{col}" if col.start_with?(CustomAttributeMixin::CUSTOM_ATTRIBUTES_PREFIX) || col.exclude?(".")

    # Reports saved by other tools may only name the last association in col_order
    tables = find_includes(col, rpt.include || {}) || col.split(".")[0..-2].join(".")
    "#{rpt.db}.#{tables}-#{col.split(".").last}"
  end

  # Build the full includes string by finding the column in the includes hash
  def find_includes(col, includes)
    tables = col.split(".")[0..-2]
    field = col.split(".").last

    table = tables.first

    # Does this level include have the table name and does columns have the field name?
    return table if includes[table] && includes[table]["columns"]&.include?(field)

    if includes[table] && includes[table]["include"]
      new_col = [tables[1..], field].flatten.join('.')
      # recursively search it for the table.col
      inc_table = find_includes(new_col, includes[table]["include"])
      return "#{table}.#{inc_table}" if inc_table
    end

    # Need to go to the next level
    includes.each_pair do |key, inc|
      next unless inc["include"]

      inc_table = find_includes(col, inc["include"])
      return nil if inc_table.nil?

      return "#{key}.#{inc_table}"
    end

    nil
  end

  # Chargeback reports also store static columns (dates, names) that the editor
  # does not offer; only cost, metric and tag columns are editable.
  def chargeback_editable_field?(field_id)
    field_id.ends_with?(*Chargeback::ALLOWED_FIELD_SUFFIXES) ||
      field_id.include?("managed") ||
      field_id.include?(CustomAttributeMixin::CUSTOM_ATTRIBUTES_PREFIX)
  end

  def editor_col_options(rpt, col_to_field)
    (rpt.col_options || {}).each_with_object({}) do |(col, option), result|
      field_id = col_to_field[col.to_s.split("__").first]
      next unless field_id && option.kind_of?(Hash)

      cleaned = option.except(:break_format)
      result[field_id] = (result[field_id] || {}).merge(cleaned) if cleaned.present?
    end
  end

  def editor_break_format(rpt)
    first_sort = Array(rpt.sortby).first
    return if first_sort.blank?

    col_options = (rpt.col_options || {}).stringify_keys
    (col_options[first_sort] || col_options[first_sort.split("__").first] || {})[:break_format]&.to_s
  end

  def editor_db_options(rpt)
    options = rpt.db_options.kind_of?(Hash) ? rpt.db_options.deep_dup : {}
    chargeback = options[:options]
    return options unless chargeback.kind_of?(Hash)

    chargeback[:tag] = [tag_category_from(chargeback[:tag]), Array(tag_values_from(chargeback[:tag]))] if chargeback[:tag].present?
    chargeback[:method_for_allocated_metrics] = (chargeback[:method_for_allocated_metrics] || "max").to_s
    options
  end

  # Core stores the absolute start offset; the editor works with it relative to the end offset.
  def editor_perf_start(db_opts)
    return unless db_opts[:start_offset] && db_opts[:end_offset]

    db_opts[:start_offset] - db_opts[:end_offset]
  end

  def tag_category_from(tag_or_tags)
    case tag_or_tags
    when String
      tag_or_tags
    when Array
      tag_or_tags.first
    else
      raise "Invalid tag category selected."
    end.split("/")[-2]
  end

  def tag_values_from(tag_or_tags)
    case tag_or_tags
    when String
      tag_or_tags.split("/")[-1]
    when Array
      tag_or_tags.map { |tag| tag.split("/")[-1] }
    else
      raise "Invalid tag value selected."
    end
  end

  # Per-field metadata the editor needs for formats, break suffixes and styling units
  def field_metadata_for(field_id)
    # Strip any pivot "__calc" suffix (e.g. "Vm-col__avg" => "Vm-col")
    bare_id = field_id.split("__").first
    column_info = MiqReport.get_col_info(bare_id)
    format_sub_type = MiqExpression.get_col_info(bare_id)[:format_sub_type]
    units = MiqExpression::FORMAT_SUB_TYPES.dig(format_sub_type, :units)
    formats = (column_info[:available_formats] || {}).invert.sort_by { |label, _| label }.map { |label, sym| [_(label), sym.to_s] }

    {
      :numeric           => column_info[:numeric],
      :data_type         => column_info[:data_type]&.to_s,
      :format_sub_type   => format_sub_type&.to_s,
      :break_suffixes    => MiqReport.get_col_break_suffixes(bare_id).map { |label, val| [_(label.to_s), val.to_s] },
      :available_formats => formats,
      :default_format    => column_info[:default_format]&.to_s,
      :units             => units&.map { |unit| [_(unit.to_s), unit.to_s] }
    }.compact
  end

  def chargeback_report_model?(model)
    klass = model.to_s.safe_constantize
    klass.kind_of?(Class) && klass < Chargeback
  end

  # What is recorded in the audit log about a report
  def report_audit_attrs(rpt)
    {
      :name      => rpt.name,
      :title     => rpt.title,
      :model     => rpt.db,
      :order     => rpt.order,
      :group     => rpt.group,
      :sortby    => Array(rpt.sortby).join(", "),
      :col_order => Array(rpt.col_order).join(", ")
    }.transform_values(&:to_s)
  end
end

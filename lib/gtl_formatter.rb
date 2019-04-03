class GtlFormatter

  PROV_STATES = {
    "pending_approval" => N_("Pending Approval"),
    "approved"         => N_("Approved"),
    "denied"           => N_("Denied")
  }.freeze

  def self.format_cols(view, row)
    rows = []
    @row = row
    @view = view

    view.col_order.each_with_index do |col, col_idx|
      next if view.column_is_hidden?(col)
      
      @col = col
      span = nil

      if view.extras[:filename] == "MiqRequest"
        celltext = miq_request_format(view.col_order[col_idx], row[col])
      elsif view.extras[:filename] == "ServiceTemplate"
        celltext = service_template_format(view.col_order[col_idx], row[col])
      elsif view.extras[:filename] == "OpenscapRuleResult"
        celltext, span = openscap_role_result_format(view.col_order[col_idx], row[col])
      elsif %w(AutomationRequest MiqRequest Container MiqTask MiqProvision).include?(view.extras[:filename])
        celltext = state_format(view.col_order[col_idx], row[col])
      elsif %w(ManageIQ_Providers_CloudManager_Template-all_vms_and_templates ManageIQ_Providers_CloudManager_Vm-vms
               ManageIQ_Providers_CloudManager_Vm-all_vms_and_templates ManageIQ_Providers_CloudManager_Vm
               ManageIQ_Providers_CloudManager_Template).include?(view.extras[:filename])
        celltext = hardware_bitness_format(view.col_order[col_idx], row[col])
      elsif view.extras[:filename] == "ManageIQ_Providers_CloudManager_Template"
        celltext = cloud_manager_template_format(view.col_order[col_idx], row[col])
      else
        celltext = format_col_for_display(view, row, col)
      end
      item = {:text => celltext}
      item[:span] = span if span.present?
      rows.push(item)
    end
    rows
  end

  def self.cloud_manager_template_format(key, value)
    if key == 'image?'
      celltext = value ? _("Image") : _("Snapshot")
    else
      celltext = hardware_bitness_format(key, value)
    end
    celltext
  end

  def self.hardware_bitness_format(key, value)
    if key == 'hardware.bitness'
      celltext = value ? "#{value} bit" : ''
    else
      celltext = format_col_for_display(@view, @row, @col)
    end
    celltext
  end

  def self.state_format(key, value)
    if key == 'state'
      celltext = value.to_s.titleize
    else
      celltext = format_col_for_display(@view, @row, @col)
    end
    celltext
  end

  def self.miq_request_format(key, value)
    if key == 'approval_state'
      celltext = _(PROV_STATES[value])
    else
      celltext = state_format(key, value)
    end
    celltext
  end

  def self.openscap_role_result_format(key, value)
    span = nil
    if key == "result"
      span = result_span_class(value)
      celltext = value.titleize
    elsif key == "severity"
      span = severity_span_class(value)
      celltext = value.titleize
    else
      celltext = format_col_for_display(@view, @row, @col)
    end
    [celltext, span]
  end

  def self.service_template_format(key, value)
    if key == "prov_type"
      celltext = value ? _(ServiceTemplate::CATALOG_ITEM_TYPES[value]) : ''
    else
      celltext = format_col_for_display(@view, @row, @col)
    end
    celltext
  end

  def self.timezone(view, row)
    if view.extras[:filename] == "MiqSchedule"
      timezone = MiqServer.my_server.server_timezone
      # Use scheduled tz for formatting, if configured
      timezone = row['run_at'][:tz] if row['run_at'] && row['run_at'][:tz]
    else
      timezone = Time.zone
    end
    timezone
  end

  # Format a column in a report view for display on the screen
  def self.format_col_for_display(view, row, col)
    celltext = view.format(col,
                           row[col],
                           :tz => timezone(view, row)).gsub(/\\/, '\&') # Call format, then escape any backslashes
    celltext
  end

  def self.result_span_class(value)
    case value.downcase
    when "pass"
      "label label-success center-block"
    when "fail"
      "label label-danger center-block"
    else
      "label label-primary center-block"
    end
  end

  def self.severity_span_class(value)
    case value.downcase
    when "high"
      "label label-danger center-block"
    when "medium"
      "label label-warning center-block"
    else
      "label label-low-severity center-block"
    end
  end
end

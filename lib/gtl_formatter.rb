class GtlFormatter

  PROV_STATES = {
    "pending_approval" => N_("Pending Approval"),
    "approved"         => N_("Approved"),
    "denied"           => N_("Denied")
  }.freeze

  def self.format_cols(view, row, tz)
    rows = []
    view.col_order.each_with_index do |col, col_idx|
      next if view.column_is_hidden?(col)

      celltext = nil
      span = nil

      if view.col_order[col_idx] == 'approval_state' && view.extras[:filename] == "MiqRequest"
        celltext = _(PROV_STATES[row[col]])
      elsif view.col_order[col_idx] == 'prov_type' && view.extras[:filename] == "ServiceTemplate"
        celltext = row[col] ? _(ServiceTemplate::CATALOG_ITEM_TYPES[row[col]]) : ''
      elsif view.col_order[col_idx] == "result" && view.extras[:filename] == "OpenscapRuleResult"
        span = result_span_class(row[col])
        celltext = row[col].titleize
      elsif view.col_order[col_idx] == "severity" && view.extras[:filename] == "OpenscapRuleResult"
        span = severity_span_class(row[col])
        celltext = row[col].titleize
      elsif view.col_order[col_idx] == 'state' && %w(AutomationRequest MiqRequest Container MiqTask MiqProvision).include?(view.extras[:filename])
        celltext = row[col].to_s.titleize
      elsif view.col_order[col_idx] == 'hardware.bitness' && %w(ManageIQ_Providers_CloudManager_Template-all_vms_and_templates
                                                                  ManageIQ_Providers_CloudManager_Vm-all_vms_and_templates
                                                                  ManageIQ_Providers_CloudManager_Vm ManageIQ_Providers_CloudManager_Vm-vms
                                                                  ManageIQ_Providers_CloudManager_Template).include?(view.extras[:filename])
        celltext = row[col] ? "#{row[col]} bit" : ''
      elsif view.col_order[col_idx] == 'image?' && view.extras[:filename] == "ManageIQ_Providers_CloudManager_Template"
        celltext = row[col] ? _("Image") : _("Snapshot")
      else
        # Use scheduled tz for formatting, if configured
        if ['miqschedule'].include?(view.db.downcase)
          celltz = row['run_at'][:tz] if row['run_at'] && row['run_at'][:tz]
        end
        celltext = format_col_for_display(view, row, col, celltz || tz)
      end
      item = {:text => celltext}
      item[:span] = span if span.present?
      rows.push(item)
    end
    rows
  end

  # Format a column in a report view for display on the screen
  def self.format_col_for_display(view, row, col, tz = nil)
    tz ||= ["miqschedule"].include?(view.db.downcase) ? MiqServer.my_server.server_timezone : Time.zone
    celltext = view.format(col,
                           row[col],
                           :tz => tz).gsub(/\\/, '\&') # Call format, then escape any backslashes
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

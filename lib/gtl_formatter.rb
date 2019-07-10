class GtlFormatter
  def self.format_cols(view, row, controller)
    cols = []

    state = {"state" => :state_format}
    hardware = {"hardware.bitness" => :hardware_bitness_format}
    special_cases = {
      "AutomationRequest"                                              => state,
      "Container"                                                      => state,
      "MiqTask"                                                        => state,
      "MiqProvision"                                                   => state,
      "MiqRequest"                                                     => state.merge({
        'approval_state' => :miq_request_format,
      }),
      "ManageIQ_Providers_CloudManager_Template-all_vms_and_templates" => hardware,
      "ManageIQ_Providers_CloudManager_Vm-vms"                         => hardware,
      "ManageIQ_Providers_CloudManager_Vm-all_vms_and_templates"       => hardware,
      "ManageIQ_Providers_CloudManager_Vm"                             => hardware,
      "ManageIQ_Providers_CloudManager_Template"                       => hardware.merge({
        "image?" => :cloud_manager_template_format,
      }),
      "MiqSchedule" => :timezone, # all fields have same specific format
      "MiqAlert"    => {
        "severity" => :alert_severity_format,
      },
      "OpenscapRuleResult" => {
        "result"   => :result_format,
        "severity" => :severity_format,
      },
      "ServiceTemplate" => {
        "prov_type" => :service_template_format,
      },
    }

    view.col_order.each_with_index do |col, col_idx|
      next if view.column_is_hidden?(col, controller)

      span = nil

      if special_cases[view.extras[:filename]].kind_of?(Symbol)
        celltext = send(special_cases[view.extras[:filename]], view, row, col)
      elsif special_cases[view.extras[:filename]].kind_of?(Hash) && special_cases[view.extras[:filename]][view.col_order[col_idx]].present?
        celltext, span = send(special_cases[view.extras[:filename]][view.col_order[col_idx]], row[col])
      else
        celltext = format_col_for_display(view, row, col)
      end

      item = {:text => celltext}
      item[:span] = span if span.present?
      cols.push(item)
    end
    cols
  end

  def self.cloud_manager_template_format(value)
    [value ? _("Image") : _("Snapshot"), nil]
  end

  def self.hardware_bitness_format(value)
    [value ? "#{value} bit" : '', nil]
  end

  def self.state_format(value)
    [value.to_s.titleize, nil]
  end

  def self.miq_request_format(value)
    [_(MiqRequestController::PROV_STATES[value]), nil]
  end

  def self.service_template_format(value)
    [value ? _(ServiceTemplate::CATALOG_ITEM_TYPES[value]) : '', nil]
  end

  def self.timezone(view, row, col)
    timezone = MiqServer.my_server.server_timezone
    # Use scheduled tz for formatting, if configured
    timezone = row['run_at'][:tz] if row['run_at'] && row['run_at'][:tz]
    format_col_for_display(view, row, col, timezone)
  end

  # Format a column in a report view for display on the screen
  def self.format_col_for_display(view, row, col, tz = Time.zone)
    view.format(col, row[col], :tz => tz).gsub(/\\/, '\&') # Call format, then escape any backslashes
  end

  def self.result_format(value)
    span = case value.downcase
           when "pass"
             "label label-success center-block"
           when "fail"
             "label label-danger center-block"
           else
             "label label-primary center-block"
           end
    [value.titleize, span]
  end

  def self.severity_format(value)
    span = case value.downcase
           when "high"
             "label label-danger center-block"
           when "medium"
             "label label-warning center-block"
           else
             "label label-low-severity center-block"
           end
    [value.titleize, span]
  end

  def self.alert_severity_format(value)
    [_(MiqPolicyController::Alerts::SEVERITIES[value]), nil]
  end
end

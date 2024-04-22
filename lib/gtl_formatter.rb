class GtlFormatter
  extend ActionView::Helpers::DateHelper

  # TODO: make sure we can autoload this properly without loading core first
  include QuadiconHelper

  VIEW_WITH_CUSTOM_ICON = %w[
    Service
    ServiceTemplate
  ]

  COLUMN_WITH_ICON = {
    'authentication_status'  => 'authentication_status_image',
    'last_compliance_status' => 'last_compliance_status_image',
  }.freeze

  COLUMN_WITH_BACKGROUND_ICON = {
    'normalized_state' => 'normalized_state_image'
  }.freeze

  COLUMN_WITH_OS_ICON = {
    'os_image_name' => 'os_info_details'
  }.freeze

  COLUMN_WITH_OS_TEXT = %w[
    product_name
  ].freeze

  COLUMN_WITH_IMAGE = {
    'ext_management_system.name' => 'fonticon_or_fileicon'
  }.freeze

  NORMALIZED_STATE_ICON = {
    'archived'                  => 'fa fa-archive',
    'orphaned'                  => 'ff ff-orphaned',
    'retired'                   => 'fa fa-clock-o',
    'non_operational'           => 'fa fa-exclamation',
    'suspended'                 => 'pficon pficon-asleep',
    'standby'                   => 'pficon pficon-asleep',
    'paused'                    => 'pficon pficon-asleep',
    'disconnecting'             => 'pficon pficon-unplugged',
    'image_locked'              => 'pficon pficon-locked',
    'migrating'                 => 'pficon pficon-migration',
    'shelved'                   => 'pficon pficon-pending',
    'shelved_offloaded'         => 'pficon pficon-pending',
    'reboot_in_progress'        => 'pficon pficon-on',
    'wait_for_launch'           => 'pficon pficon-asleep',
    'on'                        => 'pficon pficon-on',
    'never'                     => 'pficon pficon-off',
    'terminated'                => 'pficon pficon-off',
    'off'                       => 'pficon pficon-off',
    'template'                  => 'pficon pficon-template',
    'powering_up'               => 'pficon pficon-on',
    'powering_down'             => 'pficon pficon-off',
    'unknown'                   => 'pficon pficon-unknown',
  }.freeze

  COLUMN_WITH_TIME = %w[
    last_scan_on
  ].freeze

  def self.format_cols(view, row, controller, options)
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
    # all tables get a first column for icons.
    cols.push(format_icon_column(view, row, controller, options[:clickable])) if VIEW_WITH_CUSTOM_ICON.include?(view.db)
    # row is a ruport object, so we use listicon_item to look up the original record for the row.
    record = controller.listicon_item(view, row['id'])
    view.col_order.each_with_index do |col, col_idx|
      next if view.column_is_hidden?(col, controller)

      span = nil

      if special_cases[view.extras[:filename]].kind_of?(Symbol)
        celltext = send(special_cases[view.extras[:filename]], view, row, col)
      elsif special_cases[view.extras[:filename]].kind_of?(Hash) && special_cases[view.extras[:filename]][view.col_order[col_idx]].present?
        celltext, span = send(special_cases[view.extras[:filename]][view.col_order[col_idx]], row[col])
      elsif COLUMN_WITH_IMAGE.key?(col)
        # Generate html for the list icon
        # NOTE: COLUMN_WITH_IMAGE basically whitelists these associations
        associations = col.split('.')[0..-2] # drop the last value - the column name
        # follow associations so we can pass the approperiate record to be decorated / displayed
        col_record = associations.inject(record) { |r, association_name| r.send(association_name) }
        # NOTE: currently this only calls fonticon_or_fileicon
        icon, icon2, image = send(COLUMN_WITH_IMAGE[col], col_record)
        text = format_col_for_display(view, row, col)
        item = {:title => text,
                :image => ActionController::Base.helpers.image_path(image.to_s),
                :icon  => icon,
                :icon2 => icon2,
                :text  => text}.compact
      elsif COLUMN_WITH_BACKGROUND_ICON.key?(col)
        # Generate html for the list icon with background
        icon = send(COLUMN_WITH_BACKGROUND_ICON[col], record)
        text = format_col_for_display(view, row, col)
        item = {:title      => text,
                :icon       => icon,
                :background => textual_power_state_whitelisted(row[col]),
                :text       => text}.compact
      elsif COLUMN_WITH_ICON.key?(col)
        # Generate html for the list icon
        icon = send(COLUMN_WITH_ICON[col], record)
        text = format_col_for_display(view, row, col)
        item = {:title => text,
                :icon  => icon,
                :text  => text}.compact
      elsif COLUMN_WITH_TIME.include?(col)
        celltext = format_time_for_display(row, col)
      elsif COLUMN_WITH_OS_TEXT.include?(col)
        osicon_col = view.col_order.detect { |c| COLUMN_WITH_OS_ICON.key?(c) }
        if osicon_col
          osicon = send(COLUMN_WITH_OS_ICON[osicon_col], record)
          ostext = format_col_for_display(view, row, osicon_col).presence || _("Unknown")
        end
        name = format_col_for_display(view, row, col)
        text = name.presence || ostext
        image = osicon || ''
        item = {:title => text,
                :image => ActionController::Base.helpers.image_path(image.to_s),
                :text  => text}.compact
      else
        celltext = format_col_for_display(view, row, col)
      end

      item ||= {:text => celltext}
      item[:span] = span if span.present?
      cols.push(item)
    end

    # Append a button if @row_button is set and the button is defined in the related decorator
    button = record.decorate.try(:gtl_button_cell) if options[:row_button]
    cols.push(button) if button

    cols
  end

  def self.textual_power_state_whitelisted(state)
    state = state.blank? ? 'unknown' : state.downcase
    quad_icon = QuadiconHelper.machine_state(state)
    quad_icon[:background]
  end

  # NOTE: this is for the icon column
  #       so unlike the others, there is no text here
  def self.format_icon_column(view, row, controller, clickable)
    item = controller.listicon_item(view, row['id'])
    icon, icon2, image = fonticon_or_fileicon(item)

    # Clickable should be false only when it's explicitly set to false
    {:title => clickable == false ? nil : _('View this item'),
     :image => ActionController::Base.helpers.image_path(image.to_s),
     :icon  => icon,
     :icon2 => icon2}.compact
  end

  def self.os_info_details(item)
    "svg/os-#{item.os_image_name}.svg"
  end

  def self.fonticon_or_fileicon(item)
    return nil unless item
    decorated = item.decorate
    [
      decorated.try(:fonticon),
      decorated.try(:secondary_icon),
      decorated.try(:fileicon)
    ]
  end

  def self.last_compliance_status_image(item)
    case item.last_compliance_status
    when true
      "pficon pficon-ok"
    when false
      "pficon pficon-error-circle-o"
    end
  end

  def self.authentication_status_image(item)
    case item.authentication_status.downcase
    when "error", "invalid"
      "pficon pficon-error-circle-o"
    when "valid"
      "pficon pficon-ok"
    when "none"
      "pficon pficon-unknown"
    else
      "pficon pficon-warning-triangle-o"
    end
  end

  def self.normalized_state_image(item)
    NORMALIZED_STATE_ICON[item.normalized_state]
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
    [value ? _(ServiceTemplate.all_catalog_item_types[value]) : '', nil]
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

  # Format a time column in a report view for display on the screen
  def self.format_time_for_display(row, col, tz = Time.zone)
    if row[col]
      time_str = self.time_ago_in_words(row[col].in_time_zone(tz)).titleize
      _("%{time} Ago") % { :time => time_str }
    else
      _("Never")
    end
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
    [_(MiqAlertController::SEVERITIES[value]), nil]
  end
end

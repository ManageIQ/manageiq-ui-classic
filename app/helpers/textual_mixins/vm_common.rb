module TextualMixins::VmCommon
  def textual_group_diagnostics
    TextualGroup.new(_("Diagnostics"), %i[processes event_logs])
  end

  def textual_group_vmsafe
    TextualGroup.new(
      _("VMsafe"),
      %i[vmsafe_enable vmsafe_agent_address vmsafe_agent_port vmsafe_fail_open vmsafe_immutable_vm vmsafe_timeout]
    )
  end

  def textual_group_miq_custom_attributes
    TextualGroup.new(_("Custom Attributes"), textual_miq_custom_attributes)
  end

  def textual_group_ems_custom_attributes
    TextualGroup.new(_("VC Custom Attributes"), textual_ems_custom_attributes)
  end

  def textual_group_power_management
    TextualGroup.new(_("Power Management"), %i[power_state boot_time state_changed_on])
  end

  def textual_group_configuration
    TextualGroup.new(
      _("Configuration"),
      %i[guest_applications init_processes win32_services kernel_drivers filesystem_drivers filesystems registry_items]
    )
  end

  #
  # Items
  #
  def textual_server
    @record.miq_server && "#{@record.miq_server.name} [#{@record.miq_server.id}]"
  end

  def textual_mac_address
    return nil if @record.template?

    macs = @record.mac_addresses
    {:label => n_("MAC Address", "MAC Addresses", macs.size), :value => macs.join(", ")}
  end

  def textual_custom_1
    return nil if @record.custom_1.blank?

    {:label => _("Custom Identifier"), :value => @record.custom_1}
  end

  def os_normalized
    @record.os_image_name.downcase
  end

  def os_linux_or_unknown?
    os = os_normalized
    os == "unknown" || os.include?('linux')
  end

  def textual_guest_applications
    os = os_normalized
    return nil if os == "unknown"

    num = @record.number_of(:guest_applications)
    label = os.include?('linux') ? n_("Package", "Packages", num) : n_("Application", "Applications", num)

    h = {:label => label, :icon => "ff ff-software-package", :value => num}
    if num.positive?
      h[:title] = _("Show the %{label} installed on this VM") % {:label => label}
      h[:explorer] = true
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'guest_applications', :id => @record)
    end
    h
  end

  def textual_users
    num = @record.number_of(:users)
    h = {:label => _("Users"), :icon => "pficon pficon-user", :value => num}
    if num.positive?
      h[:title] = n_("Show the User defined on this VM", "Show the Users defined on this VM", num)
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'users', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_groups
    num = @record.number_of(:groups)
    h = {:label => _("Groups"), :icon => "ff ff-group", :value => num}
    if num.positive?
      h[:title] = n_("Show the Group defined on this VM", "Show the Groups defined on this VM", num)
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'groups', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_win32_services
    return nil if os_linux_or_unknown?

    num = @record.number_of(:win32_services)
    h = {:label => _("Win32 Services"), :icon => "fa fa-cog", :value => num}
    if num.positive?
      h[:title] = n_("Show the Win32 Service installed on this VM", "Show the Win32 Services installed on this VM", num)
      h[:explorer] = true
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'win32_services', :id => @record)
    end
    h
  end

  def textual_kernel_drivers
    return nil if os_linux_or_unknown?

    num = @record.number_of(:kernel_drivers)
    # TODO: Why is this image different than graphical?
    h = {:label => _("Kernel Drivers"), :icon => "fa fa-cog", :value => num}
    if num.positive?
      h[:title] = n_("Show the Kernel Driver installed on this VM", "Show the Kernel Drivers installed on this VM", num)
      h[:explorer] = true
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'kernel_drivers', :id => @record)
    end
    h
  end

  def textual_filesystem_drivers
    return nil if os_linux_or_unknown?

    num = @record.number_of(:filesystem_drivers)
    # TODO: Why is this image different than graphical?
    h = {:label => _("File System Drivers"), :icon => "fa fa-cog", :value => num}
    if num.positive?
      h[:title] = n_("Show the File System Driver installed on this VM",
                     "Show the File System Drivers installed on this VM", num)
      h[:explorer] = true
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'filesystem_drivers', :id => @record)
    end
    h
  end

  def textual_registry_items
    return nil if os_linux_or_unknown?

    num = @record.number_of(:registry_items)
    # TODO: Why is this label different from the link title text?
    h = {:label => _("Registry Entries"), :icon => "pficon pficon-registry", :value => num}
    if num.positive?
      h[:title] = n_("Show the Registry Item installed on this VM", "Show the Registry Items installed on this VM", num)
      h[:explorer] = true
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'registry_items', :id => @record)
    end
    h
  end

  def textual_snapshots
    num = @record.number_of(:snapshots)
    h = {:label => _("Snapshots"), :icon => "fa fa-camera", :value => (num.zero? ? _("None") : num)}
    if role_allows?(:feature => "vm_snapshot_show_list") && @record.supports?(:snapshots)
      h[:title] = _("Show the snapshot info for this VM")
      h[:explorer] = true
      h[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'snapshot_info')
    end
    h
  end

  def textual_resources
    {:label => _("Resources"), :value => _("Available"), :title => _("Show resources of this VM"), :explorer => true,
      :link => url_for_only_path(:action => 'show', :id => @record, :display => 'resources_info')}
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_event_logs
    return nil if @record.kind_of?(ManageIQ::Providers::CloudManager::Template)

    num = @record.operating_system.nil? ? 0 : @record.operating_system.number_of(:event_logs)
    h = {:label => _("Event Logs"), :icon => "fa fa-file-text-o", :value => (num.zero? ? _("Not Available") : _("Available"))}
    if num.positive?
      h[:title] = n_("Show Event Log on this VM", "Show Event Logs on this VM", num)
      h[:explorer] = true
      h[:link] = url_for_only_path(:controller => controller.controller_name, :action => 'event_logs', :id => @record)
    end
    h
  end

  def textual_vmsafe_enable
    return nil if @record.vmsafe_enable || @record.kind_of?(ManageIQ::Providers::CloudManager::Template)

    {:label => _("Enable"), :value => "false"}
  end

  def textual_processes
    return nil if @record.kind_of?(ManageIQ::Providers::CloudManager::Template)

    h = {:label => _("Running Processes"), :icon => "fa fa-cog"}
    date = last_date(:processes)
    if date.nil?
      h[:value] = _("Not Available")
    else
      # TODO: Why does this date differ in style from the compliance one?
      h[:value] = _("From %{time} Ago") % {:time => time_ago_in_words(date.in_time_zone(Time.zone)).titleize}
      h[:title] = _("Show Running Processes on this VM")
      h[:explorer] = true
      h[:link] = url_for_only_path(:controller => controller.controller_name, :action => 'processes', :id => @record)
    end
    h
  end

  def textual_vmsafe_agent_address
    return nil unless @record.vmsafe_enable

    {:label => _("Agent Address"), :value => @record.vmsafe_agent_address}
  end

  def textual_vmsafe_agent_port
    return nil unless @record.vmsafe_enable

    {:label => _("Agent Port"), :value => @record.vmsafe_agent_port}
  end

  def textual_vmsafe_fail_open
    return nil unless @record.vmsafe_enable

    {:label => _("Fail Open"), :value => @record.vmsafe_fail_open}
  end

  def textual_vmsafe_immutable_vm
    return nil unless @record.vmsafe_enable

    {:label => _("Immutable VM"), :value => @record.vmsafe_immutable_vm}
  end

  def textual_vmsafe_timeout
    return nil unless @record.vmsafe_enable

    {:label => _("Timeout (ms)"), :value => @record.vmsafe_timeout_ms}
  end

  def textual_miq_custom_attributes
    attrs = @record.miq_custom_attributes
    return nil if attrs.blank?

    attrs.sort_by(&:name).collect { |a| {:label => a.name, :value => a.value} }
  end

  def textual_ems_custom_attributes
    attrs = @record.ems_custom_attributes
    return nil if attrs.blank?

    attrs.sort_by { |a| a.name.to_s }.collect { |a| {:label => a.name, :value => a.value} }
  end

  def textual_compliance_history
    super(:title    => _("Show Compliance History of this VM (Last 10 Checks)"),
          :explorer => true)
  end

  def textual_boot_time
    return nil if @record.kind_of?(ManageIQ::Providers::CloudManager::Template)

    date = @record.boot_time
    {:label => _("Last Boot Time"), :value => (date.nil? ? _("N/A") : format_timezone(date))}
  end

  def textual_state_changed_on
    return nil if @record.kind_of?(ManageIQ::Providers::CloudManager::Template)

    date = @record.state_changed_on
    {:label => _("State Changed On"), :value => (date.nil? ? _("N/A") : format_timezone(date))}
  end
end

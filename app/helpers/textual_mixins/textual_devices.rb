module TextualMixins::TextualDevices
  def textual_devices
    devices = get_devices
    h = {:label    => _("Devices"),
         :icon     => "fa fa-hdd-o",
         :explorer => true,
         :value    => (devices.nil? || devices.empty? ? _("None") : devices.length)}
    if devices.length > 0
      h[:title] = _("Show VMs devices")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'devices')
    end
    h
  end

  def get_devices
    devices = []
    if @record.hardware.cpu_total_cores
      cpu_details =
        if @record.num_cpu && @record.cpu_cores_per_socket
          " (#{pluralize(@record.num_cpu, 'socket')} x #{pluralize(@record.cpu_cores_per_socket, 'core')})"
        else
          ""
        end

      devices.push(:device      => _("Processors"),
                   :description => "#{@record.hardware.cpu_total_cores}#{cpu_details}",
                   :icon        => "processor")
    end

    devices.push(:device      => _("CPU Type"),
                 :description => @record.hardware.cpu_type,
                 :icon        => "processor") if @record.hardware.cpu_type
    devices.push(:device      => _("CPU Speed"),
                 :description => "#{@record.hardware.cpu_speed} MHz",
                 :icon        => "processor") if @record.hardware.cpu_speed
    devices.push(:device      => _("Memory"),
                 :description => "#{@record.hardware.memory_mb} MB",
                 :icon        => "memory") if @record.hardware.memory_mb

    # Add disks to the device array
    unless @record.hardware.disks.nil?
      @record.hardware.disks.each do |disk|
        # relying on to_s to force nils into ""
        loc = disk.location.to_s

        # default device is controller_type
        dev = disk.controller_type ? "#{disk.controller_type} #{loc}" : ""

        # default description is filename
        desc = disk.filename.to_s

        # default icon prefix is device_name
        icon = disk.device_name.to_s

        conn = disk.start_connected ? _(", Connect at Power On = Yes") : _(", Connect at Power On = No")

        # Customize disk entries by type
        if disk.device_type == "cdrom-raw"
          dev = _("CD-ROM (IDE %{location})%{connection}") % {:location => loc, :connection => conn}
          icon = "cdrom"
        elsif disk.device_type == "atapi-cdrom"
          dev = _("ATAPI CD-ROM (IDE %{location})%{connection}") % {:location => loc, :connection => conn}
          icon = "cdrom"
        elsif disk.device_type == "cdrom-image"
          dev = _("CD-ROM Image (IDE %{location})%{connection}") % {:location => loc, :connection => conn}
          icon = "cdrom"
        elsif disk.device_type == "disk"
          icon = "disk"
          if disk.controller_type == "ide"
            dev = _("Hard Disk (IDE %{location})") % {:location => loc}
          elsif disk.controller_type == "scsi"
            dev = _("Hard Disk (SCSI %{location})") % {:location => loc}
            icon = "scsi"
          end
          unless disk.size.nil?
            dev += _(", Size: %{number}") % {:number => number_to_human_size(disk.size, :precision => 2)}
          end
          unless disk.size_on_disk.nil?
            dev += _(", Size on disk: %{number}") % {:number => number_to_human_size(disk.size_on_disk,
                                                                                     :precision => 2)}
          end
          unless disk.used_percent_of_provisioned.nil?
            dev += _(", Percent Used Provisioned Space: %{number}%%") %
              {:number => disk.used_percent_of_provisioned.to_s}
          end
          desc += _(", Mode: %{mode}") % {:mode => disk.mode} unless disk.mode.nil?
        elsif disk.device_type == "ide"
          dev = _("Hard Disk (IDE %{location})") % {:location => loc}
          unless disk.size.nil?
            dev += _(", Size: %{number}") % {:number => number_to_human_size(disk.size, :precision => 2)}
          end
          unless disk.size_on_disk.nil?
            dev += _(", Size on disk: %{number}") % {:number => number_to_human_size(disk.size_on_disk, :precision => 2)}
          end
          unless disk.used_percent_of_provisioned.nil?
            dev += _(", Percent Used Provisioned Space: %{number}%%") %
              {:number => disk.used_percent_of_provisioned.to_s}
          end
          desc += _(", Mode: %{mode}") % {:mode => disk.mode} unless disk.mode.nil?
          icon = "disk"
        elsif ["scsi", "scsi-hardDisk"].include?(disk.device_type)
          dev = _("Hard Disk (SCSI %{location})") % {:location => loc}
          unless disk.size.nil?
            dev += _(", Size: %{number}") % {:number => number_to_human_size(disk.size, :precision => 2)}
          end
          unless disk.size_on_disk.nil?
            dev += _(", Size on disk: %{number}") % {:number => number_to_human_size(disk.size_on_disk,
                                                                                     :precision => 2)}
          end
          unless disk.used_percent_of_provisioned.nil?
            dev += _(", Percent Used Provisioned Space: %{number}%%") %
              {:number => disk.used_percent_of_provisioned.to_s}
          end
          desc += _(", Mode: %{mode}") % {:mode => disk.mode} unless disk.mode.nil?
          icon = "scsi"
        elsif disk.device_type == "scsi-passthru"
          dev = _("Generic SCSI (%{location})") % {:location => loc}
          icon = "scsi"
        elsif disk.device_type == "floppy"
          dev += conn
          icon = "floppy"
        end
        # uppercase the first character of the device name and description
        dev = dev[0..0].upcase + dev[1..-1].to_s
        desc = desc[0..0].upcase + desc[1..-1].to_s

        devices.push(:device      => dev,
                     :description => desc,
                     :icon        => icon)
      end
    end

    # Add ports to the device array
    unless @record.hardware.ports.nil?
      @record.hardware.ports.each do |port|
        loc = port.location.nil? ? "" : port.location
        loc = loc.strip == "0" ? "" : loc.next
        dev = port.controller_type << " " << loc
        desc = port.filename.nil? ? "" : port.filename
        icon = port.device_type
        # Customize port entries by type
        if port.device_type == "sound"
          dev = "Audio"
          desc = port.auto_detect.nil? ? "" : _("Default Adapter")
        end
        # uppercase the first character of the device name and description
        dev = dev[0..0].upcase + dev[1..-1]
        desc = desc[0..0].upcase + desc[1..-1] if desc.length > 0
        devices.push(:device      => dev,
                     :description => desc,
                     :icon        => icon)
      end
    end
    devices
  end
end

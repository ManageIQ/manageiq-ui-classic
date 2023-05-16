module TextualMixins
  module TextualDevices
    def textual_devices
      devices = devices_details
      h = {:label    => _("Devices"),
           :icon     => "fa fa-hdd-o",
           :explorer => true,
           :value    => devices.blank? ? _("None") : devices.length}
      if devices.present?
        h[:title] = _("Show VMs devices")
        h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'devices')
      end
      h
    end

    def processor_description
      description = if @record.num_cpu.positive? && @record.cpu_cores_per_socket.positive?
                      _("%{total_cores} (%{num_sockets} Sockets x %{num_cores} Cores)") %
                        {:total_cores => @record.cpu_total_cores,
                         :num_sockets => @record.num_cpu,
                         :num_cores   => @record.cpu_cores_per_socket}
                    else
                      _("%{total_cores}") % {:total_cores => @record.cpu_total_cores}
                    end

      Device.new(_("Processors"), description, nil, 'pficon pficon-cpu')
    end

    def cpu_attributes
      [[_("CPU Type"), :cpu_type, nil, 'pficon pficon-cpu'],
       [_("CPU Speed"), :cpu_speed, _("MHz"), 'pficon pficon-cpu'],
       [_("Memory"), :memory_mb, _("MB"), 'pficon pficon-memory']].map do |attribute|
         device = Device.new(*attribute)
         device.description_value(@record)
         device
       end
    end

    def disks_attributes
      disks = []
      return disks if @record.hardware.disks.empty?

      # HDDs
      disks = @record.hardware.hard_disks.map do |disk|
        device_name = _("Hard Disk")

        hd_name = disk.device_name.upcase
        location = disk.location.presence || _("N/A")
        size = disk.size.present? ? number_to_human_size(disk.size, :precision => 2) : _("N/A")
        pct_prov = disk.size_on_disk.nil? ? _("N/A") : disk.used_percent_of_provisioned
        filename = disk.filename.presence || _("N/A")
        mode = disk.mode.presence || _("N/A")
        description = _("Name: %{hd_name}, Location: %{location}, Size: %{size}, Percent Used Provisioned Space: %{prov}, " \
                        "Filename: %{filename}, Mode: %{mode}") % {:hd_name  => hd_name,
                                                                   :location => location,
                                                                   :size     => size,
                                                                   :prov     => pct_prov,
                                                                   :filename => filename,
                                                                   :mode     => mode}
        Device.new(device_name, description, nil, disk.decorate.fonticon)
      end

      # Floppies
      floppies = @record.hardware.floppies
      if floppies.present?
        disks += floppies.map do |floppy|
          name = floppy.controller_type.upcase
          connection = _("Connected at Power On = %{connect}") % {:connect => floppy.start_connected.to_s}
          location = floppy.location
          device_name = _("Floppy %{name} %{location} %{connection}") % {:name => name, :connection => connection, :location => location}
          Device.new(device_name, nil, nil, floppy.decorate.fonticon)
        end
      end

      # CD-ROMS
      cdroms = @record.hardware.cdroms
      if cdroms.present?
        disks += cdroms.map do |cd|
          name = cd.controller_type.upcase
          connection = _("Connected at Power On = %{connect}") % {:connect => cd.start_connected.to_s}
          location = cd.location
          device_name = _("CD-ROM (%{name} %{location}), %{connection}") % {:name => name, :location => location, :connection => connection}
          Device.new(device_name, nil, nil, cd.decorate.fonticon)
        end
      end
      disks.compact
    end

    def network_name(port)
      network = nil
      if port.lan&.switch
        network = _("Network:") + port.lan.name + lan_attribute(port)
      end
      network
    end

    def network_attributes
      networks = []
      return networks if @record.hardware.ports.empty?

      @record.hardware.ports.map do |port|
        name = "#{port.controller_type.capitalize} #{port.device_name}"
        location = port.location
        address = port.address
        filename = port.filename
        model = port.model
        autodetect = port.auto_detect ? nil : _("Default Adapter")
        desc = [location, address, filename, model, autodetect, network_name(port)].compact.join(', ')
        Device.new(name, desc, nil, port.decorate.fonticon) # TODO: look into this more if this can be SCSI, serial, parallel, usb, sound
      end
    end

    def lan_prefix(nic)
      nic.lan&.switch&.shared? ? _("Distributed ") : ''
    end

    def lan_attribute(nic)
      nic.lan&.switch&.name ? "(#{lan_prefix(nic)}#{_("Switch: ")}#{nic.lan.switch.name})" : ''
    end

    def devices_details
      devices = []
      return devices unless @record.try(:hardware)

      devices << processor_description
      devices += cpu_attributes
      devices += disks_attributes
      devices += network_attributes
      devices
    end
  end
end

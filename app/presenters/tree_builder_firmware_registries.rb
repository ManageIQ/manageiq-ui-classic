class TreeBuilderFirmwareRegistries < TreeBuilder
  has_kids_for FirmwareRegistry, %i[x_get_tree_firmware_registry_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Firmware Registries"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    count_only_or_objects(count_only, FirmwareRegistry.all, "name")
  end

  def x_get_tree_firmware_registry_kids(object, count_only)
    fw_binaries = object.firmware_binaries
    if count_only
      open_node("xx-firmware_xx-#{object.id}")
      fw_binaries.size
    else
      open_node("firmware_xx-#{object.id}")
      [
        {
          :id   => "firmware_xx-#{object.id}",
          :text => _("Firmware Binaries"),
          :icon => "pficon pficon-folder-close",
          :tip  => _("Firmware Binaries")
        }
      ]
    end
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    nodes = (object[:full_id] || object[:id]).split('_')
    fwreg = FirmwareRegistry.find_by(:id => nodes.last.split('-').last)
    objects = fwreg.firmware_binaries
    count_only_or_objects(count_only, objects, "name")
  end
end

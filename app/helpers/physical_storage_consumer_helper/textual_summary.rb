module PhysicalStorageConsumerHelper::TextualSummary
  include TextualMixins::TextualGroupTags

  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        name
        ems
        physical_storage
      ]
    )
  end

  def textual_group_relationships
  end

  def textual_group_addresses
    addresses_values = []

    addresses = Address.where(physical_storage_consumer_id: @record.id)
    addresses.each do |address|
      if defined?(address.port.iqn) && address.port.iqn
        addresses_values << [_("iqn"), address.port.iqn]
      elsif defined?(address.port.wwpn) && address.port.wwpn
        addresses_values << [_("wwpn"), address.port.wwpn]
      end
    end

    TextualMultilabel.new(
      _("Addresses"),
      :labels => [_("Type"), _("Value")],
      :values => addresses_values
    )
  end

  #
  # Items
  #

  def textual_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_physical_storage
    storage_id = @record.physical_storage_id
    return nil if storage_id.nil?
    textual_link(PhysicalStorage.find(storage_id))
  end
end

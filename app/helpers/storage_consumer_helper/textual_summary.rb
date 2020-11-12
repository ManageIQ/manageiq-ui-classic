module StorageConsumerHelper::TextualSummary
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
    TextualGroup.new(
        _("Addresses"),
        %i[
        address
      ]
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

  def textual_address
    # todo [liran] - need to be like textual_physical_storage
    # Address.find(@record.addresses_id)
    # Address.where( storage_consumer_id: @record.id)
    addresses = Address.where(storage_consumer_id: @record.id)
    {:label => _("iqn"), :value => addresses[0].iqn}
  end
end

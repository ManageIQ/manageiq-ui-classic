module HostInitiatorHelper::TextualSummary
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

  def textual_group_san_addresses
    san_addresses_values = []

    san_addresses = SanAddress.where(owner_id: @record.id)
    san_addresses.each do |san_address|
      if defined?(san_address.port.iqn) && san_address.port.iqn
        san_addresses_values << [_("iqn"), san_address.port.iqn]
      elsif defined?(address.port.wwpn) && san_address.port.wwpn
        san_addresses_values << [_("wwpn"), san_address.port.wwpn]
      end
    end

    TextualMultilabel.new(
      _("SAN Addresses"),
      :labels => [_("Type"), _("Value")],
      :values => san_addresses_values
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

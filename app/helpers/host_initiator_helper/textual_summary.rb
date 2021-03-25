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
        cloud_volumes
      ]
    )
  end

  def textual_group_san_addresses
    san_addresses_values = @record.san_addresses.map do |san_address|
      [san_address.class.display_name, san_address.address_value]
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
    textual_link(@record.physical_storage)
  end

  def textual_cloud_volumes
    num   = @record.number_of(:cloud_volumes)
    h     = {:label => _('Cloud Volumes'), :value => num, :icon => "pficon pficon-volume"}
    if num > 0 && role_allows?(:feature => "cloud_volumes_show_list")
      h[:title] = _("Show volumes mapped to this host initiator")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_volumes')
    end
    h
  end
end

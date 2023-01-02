module StorageResourceHelper::TextualSummary
  include TextualMixins::TextualGroupTags

  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        name
        logical_free
        logical_total
        capabilities
      ]
    )
  end

  def textual_group_relationships
  end

  #
  # Items
  #

  def textual_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_logical_free
    {:label => _("Free Space"), :value => number_to_human_size(@record.logical_free, :precision => 2)}
  end

  def textual_logical_total
    {:label => _("Total Size"), :value => number_to_human_size(@record.logical_total, :precision => 2)}
  end

  def textual_capabilities
    {:label => _("Capabilities"), :value => parse_capabilities(@record.capabilities)}
  end

  def parse_capabilities(capabilities)
    caps = capabilities.map do |capability|
      "#{capability['name']}: #{capability['value']}"
    end
    caps.join(", ")
  end
end

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
    values = ""
    JSON.parse(@record.capabilities).each do |capabilities|
      values += "#{capabilities['abstract_capability']}: #{capabilities['value']}, "
    end

    {:label => _("Enabled capabilities"), :value => values.chomp(', ') }
  end
end

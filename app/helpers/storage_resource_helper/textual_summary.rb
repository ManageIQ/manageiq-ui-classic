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
end

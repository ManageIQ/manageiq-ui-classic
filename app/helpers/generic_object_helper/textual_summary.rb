module GenericObjectHelper::TextualSummary
  include TextualMixins::TextualName

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name created updated))
  end

  def textual_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_created
    {:label => _("Created"), :value => format_timezone(@record.created_at)}
  end

  def textual_updated
    {:label => _("Updated"), :value => format_timezone(@record.updated_at)}
  end

  def textual_group_attribute_details_list
    TextualMultilabel.new(
      _("Attributes (#{@record.property_attributes.count})"),
      :additional_table_class => "table-fixed",
      :labels                 => [_("Name"), _("Value")],
      :values                 => attributes_array
    )
  end

  def attributes_array
    @record.property_attributes.each do |var|
      [var[0], var[1]]
    end
  end
end

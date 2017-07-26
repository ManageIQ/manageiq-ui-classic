module GenericObjectHelper::TextualSummary
  include TextualMixins::TextualName

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name))
  end

  def textual_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_group_attribute_details_list
    TextualListview.new_from_hash(textual_attribute_details_list)
  end

  def textual_attribute_details_list
    {
      :title     => _("Attributes (#{@record.property_attributes.count})"),
      :headers   => [_("Name"), _("Value")],
      :col_order => %w(name value),
      :value     => attributes_array
    }
  end

  def attributes_array
    attributes = []
    @record.property_attributes.each do |row|
      attributes.push({
        :title    => row[0],
        :name     => row[0],
        :value    => row[1],
      })
    end
    attributes
  end
end

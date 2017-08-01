module GenericObjectDefinitionHelper::TextualSummary
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

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(generic_objects))
  end

  def textual_generic_objects
    num = @record.number_of(:generic_objects)
    h = {:label => _("Instances"), :value => num}
    if role_allows?(:feature => "generic_object_view") && num > 0
      h.update(:link  => url_for_only_path(:action => 'show', :id => @record, :display => 'generic_objects'),
               :title => _('Show all Instances'))
    end
    h
  end

  def textual_group_attribute_details_list
    TextualMultilabel.new(
      _("Attributes (#{@record.property_attributes.count})"),
      :additional_table_class => "table-fixed",
      :labels                 => [_("Name"), _("Type")],
      :values                 => record_properties(:property_attributes)
    )
  end

  def textual_group_association_details_list
    TextualMultilabel.new(
      _("Associations (#{@record.property_associations.count})"),
      :additional_table_class => "table-fixed",
      :labels                 => [_("Name"), _("Class")],
      :values                 => record_properties(:property_associations)
    )
  end

  def textual_group_method_details_list
    TextualMultilabel.new(
      _("Methods (#{@record.property_methods.count})"),
      :additional_table_class => "table-fixed",
      :labels                 => [_("Name")],
      :values                 => methods_array
    )
  end

  def record_properties(property)
    @record.send(property).each do |var|
      [var[0], var[1]]
    end
  end

  def methods_array
    @record.property_methods.collect do |var|
      [var]
    end
  end
end

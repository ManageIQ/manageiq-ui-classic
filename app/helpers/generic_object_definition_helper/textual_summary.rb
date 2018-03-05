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
    record_properties_list(_("Attributes (%{count})") % {:count => @record.property_attributes.count},
                           :property_attributes,
                           [_("Name"), _("Type")])
  end

  def textual_group_association_details_list
    record_properties_list(_("Associations (%{count})") % {:count => @record.property_associations.count},
                           :property_associations,
                           [_("Name"), _("Class")])
  end

  def record_properties_list(type_and_count, type, labels)
    TextualMultilabel.new(
      type_and_count,
      :additional_table_class => "table-fixed",
      :labels                 => labels,
      :values                 => record_properties(type)
    )
  end

  def textual_group_method_details_list
    TextualMultilabel.new(
      _("Methods (%{count})") % {:count => @record.property_methods.count},
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

module GenericObjectHelper::TextualSummary
  include TextualMixins::TextualName

  def textual_group_go_properties
    TextualGroup.new(_("Properties"), %i(definition created updated))
  end

  def textual_definition
    {:label => _("Definition"), :value => @record.generic_object_definition_name}
  end

  def textual_created
    {:label => _("Created"), :value => format_timezone(@record.created_at)}
  end

  def textual_updated
    {:label => _("Updated"), :value => format_timezone(@record.updated_at)}
  end

  def textual_attributes_none
    {:label => _("No Attributes defined"), :no_value => true}
  end

  def textual_associations_none
    {:label => _("No Associations defined"), :no_value => true}
  end

  def textual_methods_none
    {:label => _("No Methods defined"), :no_value => true}
  end

  def textual_group_attribute_details_list
    if @record.property_attributes.count > 0
      TextualMultilabel.new(
        _("Attributes"),
        :additional_table_class => "table-fixed",
        :labels                 => [_("Name"), _("Value")],
        :values                 => attributes_array
      )
    else
      TextualGroup.new(_("Attributes"), %i(attributes_none))
    end
  end

  def textual_group_associations
    if @record.property_associations.count > 0
      TextualGroup.new(_("Associations"), associations)
    else
      TextualGroup.new(_("Associations"), %i(associations_none))
    end
  end

  def associations
    associations = %i()
    @record.property_associations.each do |key, _value|
      associations.push(key.to_sym)
      define_singleton_method("textual_#{key}") do
        num = @record.send(key).count
        h = {:label => _("%{label}") % {:label => key}, :value => num}
        if role_allows?(:feature => "generic_object_view") && num > 0
          h.update(:link  => url_for_only_path(:action => 'show', :id => @record, :display => key),
                   :title => _('Show all %{associated_models}') % {:associated_models => key})
        end
      end
    end
    associations
  end

  def textual_group_methods
    methods = %i()
    @record.property_methods.each do |key|
      methods.push(key.to_sym)
      define_singleton_method("textual_#{key}") do
        {:label => _("%{label}") % {:label => key}, :no_value => true}
      end
    end
    if methods.count > 0
      TextualGroup.new(_("Methods"), methods)
    else
      TextualGroup.new(_("Methods"), %i(methods_none))
    end
  end

  def attributes_array
    @record.property_attributes.each do |var|
      [var[0], var[1]]
    end
  end
end

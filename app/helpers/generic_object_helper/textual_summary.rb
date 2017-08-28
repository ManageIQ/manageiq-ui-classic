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

  def textual_group_associations
    associations = %i()
    @record.property_associations.each do |key, _value|
      associations.push(key.to_sym)
      define_singleton_method("textual_#{key}") do
        num = @record.send(key).count
        h = {:label => _("%{label}") % {:label => key.capitalize}, :value => num}
        if role_allows?(:feature => "generic_object_view") && num > 0
          h.update(:link  => url_for_only_path(:action => 'show', :id => @record, :display => key),
                   :title => _('Show all %{associated_models}') % {:associated_models => key.capitalize})
        end
      end
    end
    TextualGroup.new(_("Associations"), associations)
  end

  def attributes_array
    @record.property_attributes.each do |var|
      [var[0], var[1]]
    end
  end
end

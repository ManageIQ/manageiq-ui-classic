module GenericObjectHelper::TextualSummary
  include TextualMixins::TextualName
  include TextualMixins::TextualGroupTags

  def textual_group_go_properties
    TextualGroup.new(_("Properties"), %i[definition created updated])
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

  def textual_group_attribute_details_list
    if @record.property_attributes.count.zero?
      TextualEmpty.new(_('Attributes'), _('No Attributes defined'))
    else
      TextualMultilabel.new(
        _('Attributes'),
        :additional_table_class => 'table-fixed',
        :labels                 => [_('Name'), _('Value')],
        :values                 => @record.property_attributes.map { |a| a.take(2) }
      )
    end
  end

  def textual_group_associations
    if @record.property_associations.count.zero?
      TextualEmpty.new(_('Associations'), _('No Associations defined'))
    else
      TextualGroup.new(_("Associations"), associations)
    end
  end

  def associations
    @record.property_associations.each_with_object([]) do |(key, _value), a|
      a.push(key.to_sym)
      define_singleton_method("textual_#{key}") do
        num = @record.send(key).count
        h = {:label => _("%{label}") % {:label => key}, :value => num}
        if role_allows?(:feature => "generic_object_view") && num.positive?
          h.update(:link  => url_for_only_path(:action => 'show', :id => @record, :display => key),
                   :title => _('Show all %{associated_models}') % {:associated_models => key})
        end
      end
    end
  end

  def textual_group_methods
    methods = @record.property_methods.each_with_object([]) do |key, a|
      a << key.to_sym
      define_singleton_method("textual_#{key}") do
        {:label => _("%{label}") % {:label => key}, :no_value => true}
      end
    end

    if methods.count.zero?
      TextualEmpty.new(_('Methods'), _('No Methods defined'))
    else
      TextualGroup.new(_('Methods'), methods)
    end
  end

  def textual_group_go_relationships
    TextualGroup.new(_("Relationships"), %i[go_custom_button_events])
  end

  def textual_go_custom_button_events
    return nil unless User.current_user.super_admin_user? || User.current_user.admin?

    {
      :label => _('Custom Button Events'),
      :value => num = @record.number_of(:custom_button_events),
      :link  => num.positive? ? url_for_only_path(:action => 'show', :id => @record, :display => 'custom_button_events', :controller => 'generic_object') : nil,
      :icon  => CustomButtonEvent.decorate.fonticon
    }
  end
end

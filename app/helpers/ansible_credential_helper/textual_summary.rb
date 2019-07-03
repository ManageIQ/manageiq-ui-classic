module AnsibleCredentialHelper::TextualSummary
  include TextualMixins::TextualName

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name type created updated])
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[repositories])
  end

  def textual_group_options
    options = []

    @record.class::API_ATTRIBUTES.each do |key, value|
      next if value[:type] == :password

      options << key

      define_singleton_method "textual_#{key}" do
        {
          :label => _(value[:label]),
          :title => _(value[:help_text]),
          :value => attribute_value(key, @record)
        }
      end
    end

    TextualGroup.new(_("Credential Options"), options)
  end

  def attribute_value(key, rec)
    (rec.try(key) || rec.options.try(:[], key)).presence
  end
  private :attribute_value

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_type
    {:label => _("Authentication Type"), :value => ui_lookup(:model => @record.type)}
  end

  def textual_created
    {:label => _("Created On"), :value => format_timezone(@record.created_on)}
  end

  def textual_updated
    {:label => _("Updated On"), :value => format_timezone(@record.updated_on)}
  end

  def textual_repositories
    num = @record.number_of(:configuration_script_sources)
    h = {:label => _("Repositories"), :value => num}
    if role_allows?(:feature => "embedded_configuration_script_source_view") && num > 0
      h.update(:link  => url_for_only_path(:action => 'show', :id => @record, :display => 'repositories'),
               :title => _('Show all Repositories'))
    end
    h
  end
end

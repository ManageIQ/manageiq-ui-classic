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

    DDF.traverse(:fields => @record.class::API_ATTRIBUTES) do |field|
      next if field[:type].to_s == 'password' || field[:name].nil?

      options << field[:name].to_sym

      define_singleton_method "textual_#{field[:name]}" do
        {
          :label => _(field[:label]),
          :title => _(field[:helperText]),
          :value => attribute_value(field[:name], @record)
        }
      end
    end

    TextualGroup.new(_("Credential Options"), options)
  end

  def attribute_value(key, rec)
    key.split('.').reduce(rec) { |obj, chunk| obj.send(:try, :[], chunk) }
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

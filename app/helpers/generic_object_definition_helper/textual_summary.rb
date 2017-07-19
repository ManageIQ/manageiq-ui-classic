module GenericObjectDefinitionHelper::TextualSummary
  include TextualMixins::TextualName

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
end

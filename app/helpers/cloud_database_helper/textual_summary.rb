module CloudDatabaseHelper::TextualSummary
  include TextualMixins::TextualEmsCloud
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[ems_cloud])
  end

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name type status ems_ref])
  end

  #
  # Items
  #

  def textual_type
    {:label => _('Type'), :value => ui_lookup(:model => @record.type)}
  end

  def textual_status
    {:label => _("Status"), :value => _(@record.status)}
  end

  def textual_ems_ref
    return nil if @record.ems_ref.blank?

    {:label => _("ID within Provider"), :value => @record.ems_ref}
  end
end

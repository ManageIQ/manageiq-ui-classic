module EmsDatawarehouseHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name type hostname port))
  end

  def textual_group_status
    TextualGroup.new(_("Status"), %i(refresh_status))
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i(tags))
  end

  #
  # Items
  #

  def textual_name
    @record.name
  end

  def textual_type
    @record.emstype_description
  end

  def textual_hostname
    @record.hostname
  end

  def textual_port
    @record.supports_port? ? @record.port : nil
  end
end

module AuthKeyPairCloudHelper::TextualSummary
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  #
  # Groups
  #
  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(vms))
  end

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name fingerprint))
  end

  #
  # Items
  #
  def textual_fingerprint
    @record.fingerprint
  end

  def textual_vms
    num   = @record.number_of(:vms)
    h     = {:label => _("Instances"), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end

  def textual_group_lifecycle
    TextualGroup.new(
      _("Lifecycle"),
      %i[owner group]
    )
  end

  def textual_owner
    @record.evm_owner.try(:name)
  end

  def textual_group
    {:label => _("Group"), :value => @record.miq_group.try(:description)}
  end
end

module HostAggregateHelper::TextualSummary
  include TextualMixins::TextualEmsCloud
  include TextualMixins::TextualGroupTags
  #
  # Groups
  #

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(ems_cloud instances hosts))
  end

  #
  # Items
  #

  def textual_hosts
    num   = @record.number_of(:hosts)
    h     = {:label => _('Hosts'), :icon => "pficon pficon-container-node", :value => num}
    if num.positive? && role_allows?(:feature => "host_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'hosts')
      h[:title] = _("Show all Hosts")
    end
    h
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end
end

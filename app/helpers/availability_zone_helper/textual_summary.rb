module AvailabilityZoneHelper::TextualSummary
  include TextualMixins::TextualEmsCloud
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[ems_cloud instances cloud_volumes custom_button_events])
  end

  def textual_group_availability_zone_totals
    TextualGroup.new(_("Totals for Availability Zone"), %i[block_storage_disk_capacity block_storage_disk_usage])
  end

  #
  # Items
  #

  def textual_cloud_volumes
    num   = @record.number_of(:cloud_volumes)
    h     = {:label => _('Cloud Volumes'), :icon => "pficon pficon-volume", :value => num}
    if num > 0 && role_allows?(:feature => "cloud_volume_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_volumes')
      h[:title] = _("Show all Cloud Volumes")
    end
    h
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end

  def textual_block_storage_disk_capacity
    return nil unless @record.respond_to?(:block_storage_disk_capacity) && !@record.ext_management_system.provider.nil?
    {:label => _('Block storage disk capacity'), :value => number_to_human_size(@record.block_storage_disk_capacity.gigabytes, :precision => 2)}
  end

  def textual_block_storage_disk_usage
    return nil unless @record.respond_to?(:block_storage_disk_usage)
    {:label => _('Block storage disk usage'),
     :value => number_to_human_size(@record.block_storage_disk_usage.bytes, :precision => 2)}
  end
end

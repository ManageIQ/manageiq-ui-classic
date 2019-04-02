module CloudVolumeSnapshotHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name size description))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(parent_ems_cloud ems cloud_volume based_volumes cloud_tenant))
  end

  def textual_size
    {:label => _("Size"), :value => number_to_human_size(@record.size, :precision => 2)}
  end

  def textual_based_volumes
    num   = @record.total_based_volumes
    h     = {:label => _('Cloud Volumes Based on Snapshot'), :icon => "pficon pficon-volume", :value => num}
    if num > 0 && role_allows?(:feature => "cloud_volume_show_list")
      h[:title] = _("Show all Cloud Volumes based on this Snapshot.")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'based_volumes')
    end
    h
  end

  def textual_cloud_volume
    textual_link(@record.cloud_volume)
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_cloud_tenant
    cloud_tenant = @record.cloud_tenant if @record.respond_to?(:cloud_tenant)
    h = {:label => _('Cloud Tenants'), :icon => "pficon pficon-cloud-tenant", :value => (cloud_tenant.nil? ? _("None") : cloud_tenant.name)}
    if cloud_tenant && role_allows?(:feature => "cloud_tenant_show")
      h[:title] = _("Show this Snapshot's Cloud Tenants")
      h[:link]  = url_for_only_path(:controller => 'cloud_tenant', :action => 'show', :id => cloud_tenant)
    end
    h
  end
end

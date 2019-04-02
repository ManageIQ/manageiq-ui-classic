module CloudVolumeBackupHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name status size))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(parent_ems_cloud ems_storage cloud_volume cloud_tenant))
  end

  def textual_status
    {:label => _("Status"), :value => @record.status}
  end

  def textual_size
    {:label => _("Size"), :value => number_to_human_size(@record.size, :precision => 2)}
  end

  def textual_cloud_volume
    textual_link(@record.cloud_volume)
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_ems_storage
    textual_link(@record.ext_management_system)
  end

  def textual_cloud_tenant
    cloud_tenant = @record.try(:cloud_tenant)
    h = {:label => _('Cloud Tenants'), :icon => "pficon pficon-cloud-tenant", :value => (cloud_tenant.try(:name) || _("None"))}
    if cloud_tenant && role_allows?(:feature => "cloud_tenant_show")
      h[:title] = _("Show this Backup's Cloud Tenants")
      h[:link]  = url_for_only_path(:controller => 'cloud_tenant', :action => 'show', :id => cloud_tenant)
    end
    h
  end
end

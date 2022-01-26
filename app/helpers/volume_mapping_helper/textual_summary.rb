module VolumeMappingHelper::TextualSummary
  include TextualMixins::TextualGroupTags

  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        provider physical_storage cloud_volume host_initiator_group host_initiator lun
      ]
    )
  end

  def textual_provider
    provider = @record.ext_management_system
    if provider
      {
        :label => _("Provider"),
        :value => provider.name,
        :icon  => "pficon",
        :title => _("Show the provider of this Mapping"),
        :link  => url_for_only_path(:controller => 'ems_storage', :action => 'show', :id => provider.id)
      }
    end
  end

  def textual_physical_storage
    physical_storage = @record.physical_storage
    if physical_storage
      {
        :label => _("Physical Storage"),
        :icon  => "pficon pficon-volume",
        :title => _("Navigate to the Physical Storage of this mapping"),
        :value => physical_storage.name,
        :link  => url_for_only_path(:controller => 'physical_storage', :action => 'show', :id => physical_storage.id)
      }
    end
  end

  def textual_cloud_volume
    cloud_volume = @record.cloud_volume
    if cloud_volume
      {
        :label => _("Cloud Volume"),
        :icon  => "pficon pficon-volume",
        :title => _("Navigate to the Cloud Volume of this Mapping"),
        :value => cloud_volume.name,
        :link  => url_for_only_path(:controller => 'cloud_volume', :action => 'show', :id => cloud_volume.id)
      }
    end
  end

  def textual_host_initiator
    host_initiator = @record.host_initiator
    if host_initiator
      {
        :label => _("Host Initiator"),
        :icon  => "pficon pficon-zone",
        :title => _("Navigate to the Host Initiator of this Mapping"),
        :value => host_initiator.name,
        :link  => url_for_only_path(:controller => 'host_initiator', :action => 'show', :id => host_initiator.id)
      }
    end
  end

  def textual_host_initiator_group
    group = @record.host_initiator_group
    if group
      {
        :label => _("Host Initiator Group"),
        :icon  => "pficon pficon-zone",
        :title => _("Navigate to Host Initiator Group %{group_name}") % {:group_name => group.name},
        :value => group.name,
        :link  => url_for_only_path(:controller => 'host_initiator_group', :action => 'show', :id => group.id)
      }
    end
  end

  def textual_lun
    {:label => _("LUN"), :value => @record.lun}
  end
end

class EmsStorageDashboardService < EmsDashboardService
  def block_storage_heatmap_data
    {
      :heatmaps => heatmaps
    }.compact
  end

  def aggregate_status_data
    {
      :aggStatus => aggregate_status
    }.compact
  end

  def aggregate_event_data
    {
      :aggEvents => agg_events
    }.compact
  end

  def aggregate_status
    {
      :quadicon      => @controller.instance_exec(@ems, &EmsStorageDashboardService.quadicon_calc),
      :status        => status_data,
      :refreshStatus => refresh_data,
      :attrData      => attributes_data,
    }
  end

  def attributes_data
    attributes = if @ems.supports?(:block_storage)
                   %i[physical_storages storage_resources cloud_volumes cloud_volume_snapshots volume_mappings host_initiators host_initiator_groups storage_services]
                 else
                   %i[cloud_object_store_containers cloud_object_store_objects]
                 end

    attr_icon = {
      :physical_storages             => 'pficon pficon-container-node',
      :storage_resources             => 'pficon pficon-resource-pool',
      :cloud_volumes                 => 'pficon pficon-volume',
      :cloud_volume_snapshots        => 'fa fa-camera',
      :volume_mappings               => 'pficon pficon-topology',
      :host_initiators               => 'pficon pficon-virtual-machine',
      :host_initiator_groups         => 'ff ff-relationship',
      :storage_services              => 'pficon pficon-services',
      :cloud_object_store_containers => 'ff ff-cloud-object-store',
      :cloud_object_store_objects    => 'fa fa-star',
    }

    attr_url = {
      :storage_resources             => 'storage_resources',
      :cloud_volumes                 => 'cloud_volumes',
      :cloud_volume_snapshots        => 'cloud_volume_snapshots',
      :physical_storages             => 'physical_storages',
      :volume_mappings               => 'volume_mappings',
      :host_initiators               => 'host_initiators',
      :host_initiator_groups         => 'host_initiator_groups',
      :storage_services              => 'storage_services',
      :cloud_object_store_containers => 'cloud_object_store_containers',
      :cloud_object_store_objects    => 'cloud_object_store_objects',
    }

    attr_hsh = {
      :storage_resources             => _('Resources (Pools)'),
      :cloud_volumes                 => _('Volumes'),
      :cloud_volume_snapshots        => _('Volume Snapshots'),
      :physical_storages             => _('Physical Storages'),
      :volume_mappings               => _('Volume Mappings'),
      :host_initiators               => _('Host Initiators'),
      :host_initiator_groups         => _('Host Initiator Groups'),
      :storage_services              => _('Storage Services'),
      :cloud_object_store_containers => _('Containers'),
      :cloud_object_store_objects    => _('Objects'),
    }

    format_data('ems_storage', attributes, attr_icon, attr_url, attr_hsh)
  end

  private

  def get_physical_storages_ids
    physical_storages_ids = []
    @ems.physical_storages.each do |system|
      physical_storages_ids << system.id
    end
  end

  def heatmaps
    resource_usage = []
    @ems.physical_storages.each do |system|
      system.storage_resources.each do |resource|
        resource_usage << {
          :id       => resource.id,
          :node     => resource.name,
          :provider => resource.ext_management_system.name,
          :percent  => ((resource.logical_total.to_f - resource.logical_free.to_f) / resource.logical_total.to_f).round(2),
          :total    => number_to_human_size(resource.logical_total, :precision => 2).to_i,
          :unit     => "GB"
        }
      end
    end

    {
      :resourceUsage => resource_usage.presence,
      :title         => 'Used capacity [%]'
    }
  end

  def agg_events
    event_list = []
    event_hash = @ems.ems_events.group_by(&:physical_storage_name)
                     .transform_values do |events|
      fixed, not_fixed = events.partition { |event| event.event_type == "autosde_critical_alert_fixed" }.map(&:count)
      {:fixed => fixed, :not_fixed => not_fixed}
    end

    event_hash.each do |key, value|
      event_list << {
        :group => "fixed",
        :key   => key,
        :value => value[:fixed]
      }
      event_list << {
        :group => "not_fixed",
        :key   => key,
        :value => value[:not_fixed]
      }
    end

    event_list.to_a
  end
end

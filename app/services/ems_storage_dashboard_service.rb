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

  def aggregate_status
    {
      :quadicon => @controller.instance_exec(@ems, &EmsStorageDashboardService.quadicon_calc),
      :status   => status_data,
      :attrData => attributes_data,
    }
  end

  def attributes_data
    attributes = if @ems.supports?(:block_storage)
                   %i[storage_systems storage_resources cloud_volumes]
                 else
                   %i[cloud_object_store_containers cloud_object_store_objects]
                 end

    attr_icon = {
      :storage_systems               => 'pficon pficon-container-node',
      :storage_resources             => 'pficon pficon-resource-pool',
      :cloud_volumes                 => 'pficon pficon-volume',
      :cloud_object_store_containers => 'ff ff-cloud-object-store',
      :cloud_object_store_objects    => 'fa fa-star',
    }

    attr_url = {
      :storage_resources             => 'storage_resources',
      :cloud_volumes                 => 'cloud_volumes',
      :storage_systems               => 'storage_systems',
      :cloud_object_store_containers => 'cloud_object_store_containers',
      :cloud_object_store_objects    => 'cloud_object_store_objects',
    }

    attr_hsh = {
      :storage_resources             => _('Storage Resources (Pools)'),
      :cloud_volumes                 => _('Volumes'),
      :storage_systems               => _('Storage Systems'),
      :cloud_object_store_containers => _('Containers'),
      :cloud_object_store_objects    => _('Objects'),
    }

    format_data('ems_storage', attributes, attr_icon, attr_url, attr_hsh)
  end

  private

  def get_storage_systems_ids
    storage_systems_ids = []
    @ems.storage_systems.each do |system|
      storage_systems_ids << system.id
    end
  end

  def heatmaps
    resource_usage = []

    @ems.storage_systems.each do |system|
      system.storage_resources.each do |resource|
        resource_usage << {
          :id       => resource.id,
          :resource => resource.name,
          :provider => resource.ext_management_system.name,
          :percent  => ((resource.logical_total.to_f - resource.logical_free.to_f) / resource.logical_total.to_f).round(2)
        }
      end
    end

    {
      :resourceUsage => resource_usage.presence,
      :title         => 'Used capacity [%]'
    }
  end
end

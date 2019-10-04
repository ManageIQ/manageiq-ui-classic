class EmsCloudDashboardService < EmsDashboardService
  def recent_images_data
    recent_resources(MiqTemplate, _('Recent Images'), _('Images'))
  end

  def recent_instances_data
    recent_resources(ManageIQ::Providers::CloudManager::Vm, _('Recent Instances'), _('Instances'))
  end

  def aggregate_status_data
    {
      :aggStatus => aggregate_status
    }.compact
  end

  def aggregate_status
    {
      :quadicon => @controller.instance_exec(@ems, &EmsInfraDashboardService.quadicon_calc),
      :status   => status_data,
      :attrData => attributes_data,
    }
  end

  def attributes_data
    attributes = %i[flavors cloud_tenants miq_templates vms availability_zones security_groups cloud_networks cloud_volumes]

    attr_icon = {
      :flavors            => "pficon pficon-flavor",
      :cloud_tenants      => "pficon pficon-cloud-tenant",
      :miq_templates      => "fa fa-database",
      :vms                => "pficon pficon-virtual-machine",
      :availability_zones => "pficon pficon-zone",
      :security_groups    => "pficon pficon-cloud-security",
      :cloud_networks     => "pficon pficon-network",
      :cloud_volumes      => "pficon pficon-volume"
    }

    attr_url = {
      :flavors            => "flavors",
      :cloud_tenants      => "cloud_tenants",
      :miq_templates      => "images",
      :vms                => "instances",
      :availability_zones => "availability_zones",
      :security_groups    => "security_groups",
      :cloud_networks     => "cloud_networks",
      :cloud_volumes      => "cloud_volumes"
    }

    attr_hsh = {
      :flavors            => _("Flavors"),
      :cloud_tenants      => _("Cloud Tenants"),
      :miq_templates      => _("Images"),
      :vms                => _("Instances"),
      :availability_zones => _("Availability Zones"),
      :security_groups    => _("Security Groups"),
      :cloud_networks     => _("Cloud Networks"),
      :cloud_volumes      => _("Cloud Volumes")
    }

    format_data('ems_cloud', attributes, attr_icon, attr_url, attr_hsh)
  end
end

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
      :status   => status_data,
      :attrData => attributes_data,
    }
  end

  def attributes_data
    attributes = %i(flavors cloud_tenants miq_templates vms availability_zones security_groups cloud_networks cloud_volumes)

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
      :miq_templates      => "miq_templates",
      :vms                => "vms",
      :availability_zones => "availability_zones",
      :security_groups    => "security_groups",
      :cloud_networks     => "cloud_networks",
      :cloud_volumes      => "cloud_volumes"
    }

    attr_hsh = {
      :flavors            => "Flavors",
      :cloud_tenants      => "Cloud Tenants",
      :miq_templates      => "Images",
      :vms                => "Instances",
      :availability_zones => "Availability Zones",
      :security_groups    => "Security Groups",
      :cloud_networks     => "Cloud Networks",
      :cloud_volumes      => "Cloud Volumes"
    }

    format_data(attributes, attr_icon, attr_url, attr_hsh)
  end
end

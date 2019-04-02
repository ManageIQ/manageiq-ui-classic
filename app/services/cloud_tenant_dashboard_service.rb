class CloudTenantDashboardService < EmsCloudDashboardService
  include Mixins::CheckedIdMixin

  def initialize(tenant, controller, klass)
    @ems_id = tenant.ext_management_system.id
    @ems = find_record_with_rbac(klass, @ems_id) if @ems_id.present?
    @tenant_id = tenant.id
    @conroller = controller
  end

  def attributes_data
    attributes = %i(cloud_object_store_containers miq_templates vms security_groups cloud_networks cloud_subnets network_ports cloud_volumes)

    attr_icon = {
      :cloud_object_store_containers => 'ff ff-cloud-object-store',
      :miq_templates                 => 'fa fa-database',
      :vms                           => 'pficon pficon-virtual-machine',
      :security_groups               => 'pficon pficon-cloud-security',
      :cloud_networks                => 'ff ff-cloud-network',
      :cloud_subnets                 => 'pficon pficon-network',
      :network_ports                 => 'ff ff-network-port',
      :cloud_volumes                 => 'pficon pficon-volume'
    }

    attr_url = {
      :cloud_object_store_containers => 'cloud_object_store_containers',
      :miq_templates                 => 'images',
      :vms                           => 'instances',
      :security_groups               => 'security_groups',
      :cloud_networks                => 'cloud_networks',
      :cloud_subnets                 => 'cloud_subnets',
      :network_ports                 => 'network_ports',
      :cloud_volumes                 => 'cloud_volumes'
    }

    attr_hsh = {
      :cloud_object_store_containers => _("Cloud Object Store Containers"),
      :miq_templates                 => _("Images"),
      :vms                           => _("Instances"),
      :security_groups               => _("Security Groups"),
      :cloud_networks                => _("Cloud Networks"),
      :cloud_subnets                 => _("Cloud Subnets"),
      :network_ports                 => _("Network Ports"),
      :cloud_volumes                 => _("Cloud Volumes")
    }

    format_data('cloud_tenant', attributes, attr_icon, attr_url, attr_hsh)
  end

  def get_url(resource, _ems_id, attr_url)
    "/#{resource}/show/#{@tenant_id}?display=#{attr_url}"
  end
end

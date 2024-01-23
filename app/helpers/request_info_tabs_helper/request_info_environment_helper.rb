module RequestInfoTabsHelper::RequestInfoEnvironmentHelper
  ENV_KEYS = {
    :placement         => [:placement_auto],
    :data_center       => [:placement_dc_name],
    :cluster           => [:cluster_filter, :placement_cluster_name],
    :resource_pool     => [:rp_filter, :placement_rp_name],
    :folder            => [:placement_folder_name],
    :host              => [:host_filter, :placement_host_name],
    :datastore         => [:ds_filter, :placement_storage_profile, :placement_ds_name],
    :placement_options => [
      :cloud_tenant, :availability_zone_filter, :placement_availability_zone, :cloud_network_selection_method, :cloud_subnet, :security_groups, :floating_ip_address, :resource_group, :public_network
    ],
    :cloud_network     => [:cloud_network],
    :network_port      => [:network_port]
  }.freeze

  def environment_placement(wf)
    {
      :title => _('Placement'),
      :rows  => environment_prov_tab_fields(ENV_KEYS[:placement], wf),
    }
  end

  def environment_prov_tab_fields(keys, wf)
    prov_tab_fields(keys, wf, :environment)
  end

  def environment_keys(wf)
    [environment_placement(wf)]
  end
end

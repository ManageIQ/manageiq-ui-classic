module RequestInfoTabsHelper::RequestInfoHardwareHelper
  HARDWARE_KEYS = {
    :hardware_properties => [
      :instance_type, :sys_type, :cloud_volumes, :storage_type, :number_of_cpus, :entitled_processors, :number_of_sockets, :cores_per_socket, :vm_memory, :network_adapters, :disk_format, :allocated_disk_storage, :disk_sparsity, :guest_access_key_pair, :monitoring,
      :vm_dynamic_memory, :vm_minimum_memory, :vm_maximum_memory, :boot_disk_size, :is_preemptible,
      :cpu_hot_add, :cpu_hot_remove, :memory_hot_add, :ssh_public_key
    ],
    :vm_limits           => [:cpu_limit, :memory_limit],
    :vm_reservations     => [:cpu_reserve, :memory_reserve],

  }.freeze

  def hardware_properties(cloud_manager, workflow)
    {
      :title => cloud_manager ? _("Properties") : _("Hardware"),
      :rows  => hardware_prov_tab_fields(:hardware_properties, workflow),
    }
  end

  def hardware_vm_limit(workflow)
    {
      :title  => _("VM Limits"),
      :rows   => hardware_prov_tab_fields(:vm_limits, workflow),
    }
  end

  def hardware_vm_reservations(workflow)
    {
      :title  => _("VM Reservations"),
      :rows   => hardware_prov_tab_fields(:vm_reservations, workflow),
    }
  end

  def hardware_cloud_quota
    {
      :title  => _("Cloud Quota - move to a new component if possible"),
      :rows   => [
        {:key => :cloud_tenant, :label => _("Cloud Tenant")},
        {:key => :instance_type, :label => _("Instance Type")},
      ],
    }
  end


  def hardware_prov_tab_fields(key, workflow)
    prov_tab_fields(HARDWARE_KEYS[key], workflow, :hardware)
  end

  def hardware_conditions(workflow)
    {
      :is_cloud_manager => workflow.kind_of?(ManageIQ::Providers::CloudManager::ProvisionWorkflow),
      :is_open_stack    => workflow.kind_of?(ManageIQ::Providers::Openstack::CloudManager::ProvisionWorkflow)
    }
  end

  def hardware_keys(workflow)
    condition = hardware_conditions(workflow)
    data = [hardware_properties(condition[:is_cloud_manager], workflow)]
    unless condition[:is_cloud_manager]
      data.push(hardware_vm_limit(workflow))
      data.push(hardware_vm_reservations(workflow))
    end
    if condition[:is_open_stack]
      data.push(hardware_cloud_quota)
    end
    data
  end
end

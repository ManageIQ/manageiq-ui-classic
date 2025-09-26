module ResourcePoolCloudHelper::TextualSummary
  #
  # Groups
  #
  
  def textual_ext_management_system
    textual_link(@record.ext_management_system)
  end

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        vapp aggregate_cpu_speed aggregate_cpu_memory aggregate_physical_cpus aggregate_cpu_total_cores
        aggregate_vm_memory aggregate_vm_cpus
      ]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[ext_management_system parent_datacenter parent_cluster parent_host direct_vms allvms_size resource_pools]
    )
  end

  def textual_group_configuration
    TextualGroup.new(
      _("Configuration"),
      %i[
        memory_reserve memory_reserve_expand memory_limit memory_shares memory_shares_level cpu_reserve
        cpu_reserve_expand cpu_limit cpu_shares cpu_shares_level cpu_cores_available cpu_cores_reserve cpu_cores_limit
      ]
    )
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  #
  # Items
  #

  def textual_vapp
    {:label => _("vApp"), :value => @record.vapp}
  end

  def textual_aggregate_cpu_speed
    # TODO: Why aren't we using mhz_to_human_size here?
    return nil if @record.aggregate_cpu_speed == 0
    {:label => _("Total Host CPU Resources"),
     :value => "#{number_with_delimiter(@record.aggregate_cpu_speed)} MHz"}
  end

  def textual_aggregate_cpu_memory
    return nil if @record.aggregate_memory == 0
    {:label => _("Total Host Memory"),
     :value => number_to_human_size(@record.aggregate_memory.megabytes, :precision => 0)}
  end

  def textual_aggregate_physical_cpus
    return nil if @record.aggregate_physical_cpus == 0
    {:label => _("Total Host CPUs"),
     :value => number_with_delimiter(@record.aggregate_physical_cpus)}
  end

  def textual_aggregate_cpu_total_cores
    return nil if @record.aggregate_cpu_total_cores == 0
    {:label => _("Total Host CPU Cores"),
     :value => number_with_delimiter(@record.aggregate_cpu_total_cores)}
  end

  def textual_aggregate_vm_memory
    {:label => _("Total Configured VM Memory"), :value => number_to_human_size(@record.aggregate_vm_memory.megabytes)}
  end

  def textual_aggregate_vm_cpus
    {:label => _("Total Configured VM CPUs"), :value => number_with_delimiter(@record.aggregate_vm_cpus)}
  end

  def textual_parent_datacenter
    return nil if @record.v_parent_datacenter.nil?
    {:label => _("Parent Datacenter"), :icon => "fa fa-building-o", :value => @record.v_parent_datacenter || _("None")}
  end

  def textual_parent_cluster
    cluster = @record.parent_cluster
    return nil if cluster.nil?
    h = {:label => _("Parent Cluster"),
         :icon  => "pficon pficon-cluster",
         :value => (cluster.nil? ? _("None") : cluster.name)}
    if cluster && role_allows?(:feature => "ems_cluster_show")
      h[:title] = _("Show Parent Cluster '%{name}'") % {:name => cluster.name}
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => cluster)
    end
    h
  end

  def textual_parent_host
    host = @record.parent_host
    return nil if host.nil?
    h = {:label => _("Parent Host"),
         :icon  => "pficon pficon-container-node",
         :value => (host.nil? ? _("None") : host.name)}
    if host && role_allows?(:feature => "host_show")
      h[:title] = _("Show Parent Host '%{name}'") % {:name => host.name}
      h[:link]  = url_for_only_path(:controller => 'host', :action => 'show', :id => host)
    end
    h
  end

  def textual_direct_vms
    num = @record.v_direct_vms
    h = {:label => _("Direct VMs"), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:title] = _("Show VMs in this Resource Pool, but not in Resource Pools below")
      h[:link]  = url_for_only_path(:controller => 'resource_pool_cloud', :action => 'show', :id => @record, :display => 'vms')
    end
    h
  end

  def textual_allvms_size
    num = @record.total_vms
    h = {:label => _("All VMs"), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:title] = _("Show all VMs in this Resource Pool")
      h[:link]  = url_for_only_path(:controller => 'resource_pool_cloud', :action => 'show', :id => @record, :display => 'all_vms')
    end
    h
  end

  def textual_resource_pools
    num = @record.number_of(:resource_pools)
    h = {:label => _("Resource Pools"), :icon => "pficon pficon-resource-pool", :value => num}
    if num.positive? && role_allows?(:feature => "resource_pool_cloud_show_list")
      h[:title] = _("Show all Resource Pools in this Cloud")
      h[:link]  = url_for_only_path(:controller => "resource_pool_cloud", :action => 'show', :id => @record, :display => 'resource_pools')
    end
    h
  end

  def textual_memory_reserve
    value = @record.memory_reserve
    return nil if value.nil?
    {:label => _("Memory Reserve"), :value => value}
  end

  def textual_memory_reserve_expand
    value = @record.memory_reserve_expand
    return nil if value.nil?
    {:label => _("Memory Reserve Expand"), :value => value}
  end

  def textual_memory_limit
    value = @record.memory_limit
    return nil if value.nil?
    {:label => _("Memory Limit"), :value => (value == -1 ? _("Unlimited") : value)}
  end

  def textual_memory_shares
    value = @record.memory_shares
    return nil if value.nil?
    {:label => _("Memory Shares"), :value => value}
  end

  def textual_memory_shares_level
    value = @record.memory_shares_level
    return nil if value.nil?
    {:label => _("Memory Shares Level"), :value => value}
  end

  def textual_cpu_reserve
    value = @record.cpu_reserve
    return nil if value.nil?
    {:label => _("CPU Reserve"), :value => value}
  end

  def textual_cpu_reserve_expand
    value = @record.cpu_reserve_expand
    return nil if value.nil?
    {:label => _("CPU Reserve Expand"), :value => value}
  end

  def textual_cpu_limit
    value = @record.cpu_limit
    return nil if value.nil?
    {:label => _("CPU Limit"), :value => (value == -1 ? _("Unlimited") : value)}
  end

  def textual_cpu_shares
    value = @record.cpu_shares
    return nil if value.nil?
    {:label => _("CPU Shares"), :value => value}
  end

  def textual_cpu_shares_level
    value = @record.cpu_shares_level
    return nil if value.nil?
    {:label => _("CPU Shares Level"), :value => value}
  end

  def textual_cpu_cores_available
    value = @record.cpu_cores_available
    return nil if value.nil?
    {:label => _("CPU Cores Available"), :value => value}
  end

  def textual_cpu_cores_reserve
    value = @record.cpu_cores_reserve
    return nil if value.nil?
    {:label => _("CPU Cores Reserve"), :value => value}
  end

  def textual_cpu_cores_limit
    value = @record.cpu_cores_limit
    return nil if value.nil?
    {:label => _("CPU Cores Limit"), :value => (value == -1 ? _("Unlimited") : value)}
  end
end

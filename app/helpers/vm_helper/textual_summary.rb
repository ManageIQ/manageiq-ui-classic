module VmHelper::TextualSummary
  include TextualMixins::TextualAdvancedSettings
  include TextualMixins::TextualDescription
  include TextualMixins::TextualDrift
  include TextualMixins::TextualFilesystems
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualInitProcesses
  include TextualMixins::TextualName
  include TextualMixins::TextualOsInfo
  include TextualMixins::TextualPatches
  include TextualMixins::TextualPowerState
  include TextualMixins::TextualRegion
  include TextualMixins::TextualScanHistory
  include TextualMixins::TextualDevices
  include TextualMixins::TextualCustomButtonEvents
  include TextualMixins::TextualVmmInfo
  include TextualMixins::VmCommon
  # TODO: Determine if DoNav + url_for + :title is the right way to do links, or should it be link_to with :title

  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        id name region server description hostname ipaddress mac_address custom_1 container host_platform
        tools_status load_balancer_health_check_state osinfo devices cpu_affinity snapshots
        advanced_settings resources guid storage_profile
      ]
    )
  end

  def textual_id
    { :label => _("ID"), :value => @record.id }
  end

  def textual_group_multi_region
    TextualGroup.new(
      _('Multi Region'),
      %i[region_with_button_link]
    )
  end

  def textual_group_lifecycle
    TextualGroup.new(
      _("Lifecycle"),
      %i[discovered analyzed retirement_date retirement_state provisioned owner group]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems cluster host resource_pool storage service parent_vm genealogy drift scan_history
        cloud_network cloud_subnet custom_button_events
      ]
    )
  end

  def textual_group_vm_cloud_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems ems_infra cluster host availability_zone cloud_tenant flavor vm_template drift scan_history service genealogy
        cloud_network cloud_subnet orchestration_stack cloud_networks cloud_subnets network_routers security_groups
        floating_ips network_ports cloud_volumes custom_button_events
      ]
    )
  end

  def textual_group_template_cloud_relationships
    TextualGroup.new(_("Relationships"), %i[ems parent_vm genealogy drift scan_history cloud_tenant custom_button_events])
  end

  def textual_group_security
    TextualGroup.new(_("Security"), %i[users groups patches])
  end

  def textual_group_datastore_allocation
    TextualGroup.new(
      _("Datastore Allocation Summary"),
      %i[disks disks_aligned thin_provisioned allocated_disks allocated_total]
    )
  end

  def textual_group_datastore_usage
    TextualGroup.new(
      _("Datastore Actual Usage Summary"),
      %i[usage_disks usage_snapshots usage_disk_storage usage_overcommitted]
    )
  end

  def textual_group_labels
    TextualGroup.new(_("Labels"), textual_key_value_group(@record.custom_attributes))
  end

  def textual_group_normal_operating_ranges
    TextualCustom.new(
      _("Normal Operating Ranges (over 30 days)"),
      'OperationRanges',
      %i[
        normal_operating_ranges_cpu normal_operating_ranges_cpu_usage normal_operating_ranges_memory
        normal_operating_ranges_memory_usage
      ]
    )
  end

  #
  # Items
  #
  def textual_power_state
    textual_power_state_whitelisted_with_template
  end

  def textual_hostname
    hostnames = @record.hostnames
    {:label => n_("Hostname", "Hostnames", hostnames.size), :value => hostnames.join(", ")}
  end

  def textual_ipaddress
    ips = @record.ipaddresses
    h = {:label    => n_("IP Address", "IP Addresses", ips.size),
         :value    => ips.join(", "),
         :explorer => true}
    if @record.hardware.try(:networks) && @record.hardware.networks.present?
      h[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'networks')
    end
    h
  end

  def textual_load_balancer_health_check_state
    return nil if @record.try(:load_balancer_health_check_states).blank?
    h = {:label    => _("Load Balancer Status"),
         :value    => @record.load_balancer_health_check_state,
         :title    => @record.load_balancer_health_check_states_with_reason.join("\n"),
         :explorer => true}
    h
  end

  def textual_container
    h = {:label => _("Container")}
    vendor = @record.vendor
    if vendor.blank?
      h[:value] = _("None")
    else
      h[:image] = @record.decorate.fileicon
      h[:title] = _("Show VMM container information")
      h[:explorer] = true
      h[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'hv_info')

      cpu_details =
        if @record.num_cpu.positive? && @record.cpu_cores_per_socket.positive?
          sockets = n_("%{number} socket", "%{number} sockets", @record.num_cpu) % {:number => @record.num_cpu}
          cores = n_("%{number} core", "%{number} cores", @record.cpu_cores_per_socket) % {:number => @record.cpu_cores_per_socket}
          " (#{sockets} x #{cores})"
        else
          ""
        end
      cpus = n_("%{cpu} CPU", "%{cpu} CPUs", @record.cpu_total_cores) % {:cpu => @record.cpu_total_cores}
      h[:value] = "#{vendor}: #{cpus}#{cpu_details}, #{@record.mem_cpu} MB"
    end
    h
  end

  def textual_host_platform
    {:label => _("Parent %{title} Platform") % {:title => title_for_host},
     :value => (@record.host.nil? ? _("N/A") : @record.v_host_vmm_product)}
  end

  def textual_tools_status
    {:label => _("Platform Tools"), :icon => "pficon pficon-maintenance", :value => (@record.tools_status.nil? ? _("N/A") : @record.tools_status)}
  end

  def textual_cpu_affinity
    {:label => _("CPU Affinity"), :icon => "pficon pficon-cpu", :value => @record.cpu_affinity}
  end

  def textual_storage_profile
    return nil if @record.storage_profile.nil?
    {:label => _("Storage Profile"), :value => @record.storage_profile.name}
  end

  def textual_discovered
    {:label => _("Discovered"), :icon => "fa fa-search", :value => format_timezone(@record.created_on)}
  end

  def textual_analyzed
    {:label => _("Last Analyzed"),
     :icon  => "fa fa-search",
     :value => (@record.last_sync_on.nil? ? _("Never") : format_timezone(@record.last_sync_on))}
  end

  def textual_retirement_date
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Template)
    {:label => _("Retirement Date"),
     :icon  => "fa fa-clock-o",
     :value => @record.retires_on.nil? ? _("Never") : format_timezone(@record.retires_on)}
  end

  def textual_retirement_state
    {:label => _("Retirement State"), :value => @record.retirement_state.to_s.capitalize}
  end

  def textual_provisioned
    req = @record.miq_provision.nil? ? nil : @record.miq_provision.miq_request
    return nil if req.nil?
    {:label => _("Provisioned On"), :value => req.fulfilled_on.nil? ? "" : format_timezone(req.fulfilled_on)}
  end

  def textual_owner
    @record.evm_owner.try(:name)
  end

  def textual_group
    {:label => _("Group"), :value => @record.miq_group.try(:description)}
  end

  def textual_cluster
    cluster = @record.try(:ems_cluster)
    return nil if cluster.nil?
    h = {:label => _("Cluster"), :icon => "pficon pficon-cluster", :value => (cluster.nil? ? _("None") : cluster.name)}
    if cluster && role_allows?(:feature => "ems_cluster_show")
      h[:title] = _("Show this VM's %{title}") % {:title => title_for_cluster}
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => cluster)
    end
    h
  end

  def textual_host
    host = @record.host
    return nil if host.nil?
    h = {:label => _("Host"), :icon => "pficon pficon-cluster", :value => (host.nil? ? _("None") : host.name)}
    if host && role_allows?(:feature => "host_show")
      h[:title] = _("Show this VM's %{title}") % {:title => title_for_host}
      h[:link]  = url_for_only_path(:controller => 'host', :action => 'show', :id => host)
    end
    h
  end

  def textual_resource_pool
    rp = @record.parent_resource_pool
    h = {:label => _("Resource Pool"), :icon => "pficon pficon-resource-pool", :value => (rp.nil? ? _("None") : rp.name)}
    if rp && role_allows?(:feature => "resource_pool_show")
      h[:title] = _("Show this VM's Resource Pool")
      h[:link]  = url_for_only_path(:controller => 'resource_pool', :action => 'show', :id => rp)
    end
    h
  end

  def textual_storage
    storages = @record.storages
    h = {:label => _('Datastores'), :icon => "fa fa-database"}
    if storages.empty?
      h[:value] = _("None")
    elsif storages.length == 1
      storage = storages.first
      h[:value] = storage.name
      h[:title] = _("Show this VM's Datastores")
      h[:link]  = url_for_only_path(:controller => 'storage', :action => 'show', :id => storage)
    else
      h.delete(:image) # Image will be part of each line item, instead
      main = @record.storage
      h[:value] = storages.sort_by { |s| s.name.downcase }.collect do |s|
        {:icon  => "fa fa-database",
         :value => s.name + (s == main ? ' (main)' : ''),
         :title => _("Show this VM's Datastores"),
         :link  => url_for_only_path(:controller => 'storage', :action => 'show', :id => s)}
      end
    end
    h
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_ems_infra
    textual_link(@record.ext_management_system.try(:provider).try(:infra_ems))
  end

  def textual_availability_zone
    availability_zone = @record.availability_zone
    h = {:label => _('Availability Zone'),
         :icon  => "pficon pficon-zone",
         :value => (availability_zone.nil? ? _("None") : availability_zone.name)}
    if availability_zone && role_allows?(:feature => "availability_zone_show")
      h[:title] = _("Show this VM's Availability Zone")
      h[:link]  = url_for_only_path(:controller => 'availability_zone', :action => 'show', :id => availability_zone)
    end
    h
  end

  def textual_flavor
    flavor = @record.flavor
    h = {:label => _('Flavor'), :icon => "pficon-flavor", :value => (flavor.nil? ? _("None") : flavor.name)}
    if flavor && role_allows?(:feature => "flavor_show")
      h[:title] = _("Show this VM's Flavor")
      h[:link]  = url_for_only_path(:controller => 'flavor', :action => 'show', :id => flavor)
    end
    h
  end

  def textual_vm_template
    vm_template = @record.genealogy_parent
    h = {:label => _('VM Template'), :icon => "pficon pficon-template", :value => (vm_template.nil? ? _("None") : vm_template.name)}
    if vm_template && role_allows?(:feature => "miq_template_show")
      h[:title] = _("Show this VM's Template")
      h[:link]  = url_for_only_path(:controller => 'miq_template', :action => 'show', :id => vm_template)
    end
    h
  end

  def textual_parent_vm
    return nil unless @record.template?
    h = {:label => _("Parent VM"), :icon => "pficon pficon-virtual-machine"}
    parent_vm = @record.with_relationship_type("genealogy", &:parent)
    if parent_vm.nil?
      h[:value] = _("None")
    else
      h[:value] = parent_vm.name
      h[:title] = _("Show this Image's parent")
      h[:explorer] = true
      url, action = set_controller_action
      h[:link]  = url_for_only_path(:controller => url, :action => action, :id => parent_vm)
    end
    h
  end

  def textual_orchestration_stack
    stack = @record.orchestration_stack
    h = {:label => _('Orchestration Stack'), :icon => "ff ff-stack", :value => (stack.nil? ? _("None") : stack.name)}
    if stack && role_allows?(:feature => "orchestration_stack_show")
      h[:title] = _("Show this VM's Orchestration Stack '%{name}'") % {:name => stack.name}
      h[:link]  = url_for_only_path(:controller => 'orchestration_stack', :action => 'show', :id => stack)
    end
    h
  end

  def textual_service
    h = {:label => _("Service"), :icon => "pficon pficon-service"}
    service = @record.service
    if service.nil?
      h[:value] = _("None")
    else
      h[:value] = service.name
      h[:title] = _("Show this Service")
      h[:link]  = url_for_only_path(:controller => 'service', :action => 'show', :id => service)
    end
    h
  end

  def textual_security_groups
    num   = @record.number_of(:security_groups)
    h     = {:label => _('Security Groups'), :icon => "pficon pficon-cloud-security", :value => num}
    if num.positive? && role_allows?(:feature => "security_group_show_list")
      h[:title] = _("Show all Security Groups")
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'security_groups', :id => @record, :display => "security_groups")
    end
    h
  end

  def textual_floating_ips
    num   = @record.number_of(:floating_ips)
    h     = {:label => _('Floating IPs'), :icon => "ff ff-floating-ip", :value => num}
    if num.positive? && role_allows?(:feature => "floating_ip_show_list")
      h[:title] = _("Show all Floating IPs")
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'floating_ips', :id => @record, :display => "floating_ips")
    end
    h
  end

  def textual_network_routers
    num   = @record.number_of(:network_routers)
    h     = {:label => _('Network Routers'), :icon => "pficon pficon-route", :value => num}
    if num.positive? && role_allows?(:feature => "network_router_show_list")
      h[:title] = _("Show all Network Routers")
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'network_routers', :id => @record, :display => "network_routers")
    end
    h
  end

  def textual_cloud_subnets
    num   = @record.number_of(:cloud_subnets)
    h     = {:label => _('Cloud Subnets'), :icon => "pficon pficon-network", :value => num}
    if num.positive? && role_allows?(:feature => "cloud_subnet_show_list")
      h[:title] = _("Show all Cloud Subnets")
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'cloud_subnets', :id => @record, :display => "cloud_subnets")
    end
    h
  end

  def textual_network_ports
    num   = @record.number_of(:network_ports)
    h     = {:label => _('Network Ports'), :icon => "ff ff-network-port", :value => num}
    if num.positive? && role_allows?(:feature => "network_port_show_list")
      h[:title] = _("Show all Network Ports")
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'network_ports', :id => @record, :display => "network_ports")
    end
    h
  end

  def textual_cloud_networks
    num   = @record.number_of(:cloud_networks)
    h     = {:label => _('Cloud Networks'), :icon => "ff ff-cloud-network", :value => num}
    if num.positive? && role_allows?(:feature => "cloud_network_show_list")
      h[:title] = _("Show all Cloud Networks")
      h[:explorer] = true
      h[:link]  = url_for_only_path(:action => 'cloud_networks', :id => @record, :display => "cloud_networks")
    end
    h
  end

  def textual_cloud_tenant
    cloud_tenant = @record.cloud_tenant if @record.respond_to?(:cloud_tenant)
    h = {:label => _('Cloud Tenants'), :icon => "pficon pficon-cloud-tenant", :value => (cloud_tenant.nil? ? _("None") : cloud_tenant.name)}
    if cloud_tenant && role_allows?(:feature => "cloud_tenant_show")
      h[:title] = _("Show this VM's Cloud Tenants")
      h[:link]  = url_for_only_path(:controller => 'cloud_tenant', :action => 'show', :id => cloud_tenant)
    end
    h
  end

  def textual_cloud_volumes
    num = @record.number_of(:cloud_volumes)
    h = {:label => _('Cloud Volumes'), :icon => "pficon pficon-volume", :value => num}
    if num.positive? && role_allows?(:feature => "cloud_volume_show_list")
      h[:title]    = _("Show all Cloud Volumes attached to this VM.")
      h[:explorer] = true
      h[:link]     = url_for_only_path(:action => 'cloud_volumes', :id => @record, :display => "cloud_volumes")
    end
    h
  end

  def textual_genealogy
    {
      :label    => _("Genealogy"),
      :icon     => "ff ff-dna",
      :value    => _("Show parent and child VMs"),
      :title    => _("Show virtual machine genealogy"),
      :explorer => true,
      :spinner  => true,
      :link     => url_for_only_path(
        :controller => controller.controller_name,
        :action     => 'show',
        :id         => @record,
        :display    => "vmtree_info"
      )
    }
  end

  def textual_disks
    num = @record.hardware.nil? ? 0 : @record.hardware.number_of(:disks)
    h = {:label => _("Number of Disks"), :icon => "fa fa-hdd-o", :value => num}
    if num.positive?
      h[:title] = n_("Show disk on this VM", "Show disks on this VM", num)
      h[:explorer] = true
      h[:link] = url_for_only_path(:controller => controller.controller_name, :action => 'show', :id => @record, :display => "disks")
    end
    h
  end

  def textual_disks_aligned
    {:label => _("Disks Aligned"), :value => @record.disks_aligned}
  end

  def textual_thin_provisioned
    {:label => _("Thin Provisioning Used"), :value => @record.thin_provisioned.to_s.capitalize}
  end

  def textual_allocated_disks
    h = {:label => _("Disks")}
    value = @record.allocated_disk_storage
    h[:title] = value.nil? ? _("N/A") : "#{number_with_delimiter(value)} bytes"
    h[:value] = value.nil? ? _("N/A") : number_to_human_size(value, :precision => 2)
    h
  end

  def textual_allocated_memory
    h = {:label => _("Memory")}
    value = @record.ram_size_in_bytes_by_state
    h[:title] = value.nil? ? _("N/A") : "#{number_with_delimiter(value)} bytes"
    h[:value] = value.nil? ? _("N/A") : number_to_human_size(value, :precision => 2)
    h
  end

  def textual_allocated_total
    h = textual_allocated_disks
    h[:label] = _("Total Allocation")
    h
  end

  def textual_usage_disks
    textual_allocated_disks
  end

  def textual_usage_memory
    textual_allocated_memory
  end

  def textual_usage_snapshots
    h = {:label => _("Snapshots")}
    value = @record.snapshot_storage
    h[:title] = value.nil? ? _("N/A") : "#{number_with_delimiter(value)} bytes"
    h[:value] = value.nil? ? _("N/A") : number_to_human_size(value, :precision => 2)
    h
  end

  def textual_usage_disk_storage
    h = {:label => _("Total Datastore Used Space")}
    value = @record.used_disk_storage
    h[:title] = value.nil? ? _("N/A") : "#{number_with_delimiter(value)} bytes"
    h[:value] = value.nil? ? _("N/A") : number_to_human_size(value, :precision => 2)
    h
  end

  def textual_usage_overcommitted
    h = {:label => _("Unused/Overcommited Allocation")}
    value = @record.uncommitted_storage
    h[:title] = value.nil? ? _("N/A") : "#{number_with_delimiter(value)} bytes"
    h[:value] = if value.nil?
                  _("N/A")
                else
                  v = number_to_human_size(value.abs, :precision => 2)
                  v = _("(%{value}) * Overallocated") % {:value => v} if value.negative?
                  v
                end
    h
  end

  def textual_normal_operating_ranges_cpu
    h = {:label => _("CPU"), :value => []}
    [:max, _("Max"), :high, _("High"), :avg, _("Average"), :low, _("Low")].each_slice(2) do |key, label|
      value = @record.send("cpu_usagemhz_rate_average_#{key}_over_time_period")
      h[:value] << {:label => label, :value => (value.nil? ? _("Not Available") : mhz_to_human_size(value, 2))}
    end
    h
  end

  def textual_normal_operating_ranges_cpu_usage
    h = {:label => _("CPU Usage"), :value => []}
    [:max, _("Max"), :high, _("High"), :avg, _("Average"), :low, _("Low")].each_slice(2) do |key, label|
      value = @record.send("cpu_usage_rate_average_#{key}_over_time_period")
      h[:value] << {:label => label,
                    :value => (value.nil? ? _("Not Available") : number_to_percentage(value, :precision => 2))}
    end
    h
  end

  def textual_normal_operating_ranges_memory
    h = {:label => _("Memory"), :value => []}
    [:max, _("Max"), :high, _("High"), :avg, _("Average"), :low, _("Low")].each_slice(2) do |key, label|
      value = @record.send("derived_memory_used_#{key}_over_time_period")
      h[:value] << {:label => label,
                    :value => (value.nil? ? _("Not Available") : number_to_human_size(value.megabytes, :precision => 2))}
    end
    h
  end

  def textual_normal_operating_ranges_memory_usage
    h = {:label => _("Memory Usage"), :value => []}
    [:max, _("Max"), :high, _("High"), :avg, _("Average"), :low, _("Low")].each_slice(2) do |key, label|
      value = @record.send("mem_usage_absolute_average_#{key}_over_time_period")
      h[:value] << {:label => label,
                    :value => (value.nil? ? _("Not Available") : number_to_percentage(value, :precision => 2))}
    end
    h
  end
end

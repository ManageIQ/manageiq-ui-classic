module EmsPhysicalInfraHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  #
  # Groups
  #

  def textual_group_properties
   TextualGroup.new(
	_("Properties"),
        %i(hostname ipaddress type port guid)
   )
  end

  def textual_group_relationships
   TextualGroup.new(
          _("Relationships"),
 	  %i(physical_servers datastores vms)
   )
  end

  def textual_group_status
   TextualGroup.new(
	_("Authentications"),
        textual_authentications(@ems.authentication_userid_passwords) + %i(refresh_status orchestration_stacks_status)
   )
  end

  def textual_group_smart_management
   TextualGroup.new(
	_("Smart Management"),
	%i(zone tags)
   )
  end

  def textual_group_topology
    items = %w(topology)
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact
    TextualTags.new(
        _("Topology"), i
    )
  end

  #
  # Items
  #

  def textual_hostname
    @ems.hostname
  end

  def textual_ipaddress
    {:label => _("Discovered IP Address"), :value => @ems.ipaddress}
  end

  def textual_type
    {:label => _("Type"), :value => @ems.emstype_description}
  end

  def textual_port
    @ems.supports_port? ? {:label => _("API Port"), :value => @ems.port} : nil
  end

  def textual_physical_servers
    #TODO: (walteraa) Use textual_link 
    {:label =>  _("Physical Servers"), :link  => "/ems_physical_infra/#{@ems.id}?display=physical_servers",  :icon =>  "pficon pficon-server", :value  => @ems.number_of(:physical_servers)} 
  end

  def textual_cpu_resources
    {:label => _("Aggregate %{title} CPU Resources") % {:title => title_for_host},
     :value => mhz_to_human_size(@ems.aggregate_cpu_speed)}
  end
  def textual_memory_resources
    {:label => _("Aggregate %{title} Memory") % {:title => title_for_host},
     :value => number_to_human_size(@ems.aggregate_memory * 1.megabyte, :precision => 0)}
  end

  def textual_cpus
    {:label => _("Aggregate %{title} CPUs") % {:title => title_for_host}, :value => @ems.aggregate_physical_cpus}
  end

  def textual_cpu_cores
    {:label => _("Aggregate %{title} CPU Cores") % {:title => title_for_host}, :value => @ems.aggregate_cpu_total_cores}
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @ems.guid}
  end

  def textual_infrastructure_folders
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)
    label     = "#{title_for_hosts} & #{title_for_clusters}"
    available = @ems.number_of(:ems_folders) > 0 && @ems.ems_folder_root
    h         = {:label => label, :icon => "pficon pficon-virtual-machine", :value => available ? _("Available") : _("N/A")}
    if available
      h[:link]  = ems_infra_path(@ems.id, :display => 'ems_folders')
      h[:title] = _("Show %{label}") % {:label => label}
    end
    h
  end

  def textual_folders
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)
    label     = _("VMs & Templates")
    available = @ems.number_of(:ems_folders) > 0 && @ems.ems_folder_root
    h         = {:label => label, :icon => "pficon pficon-virtual-machine", :value => available ? _("Available") : _("N/A")}
    if available
      h[:link]  = ems_infra_path(@ems.id, :display => 'ems_folders', :vat => true)
      h[:title] = _("Show Virtual Machines & Templates")
    end
    h
  end

  def textual_clusters
    label = title_for_clusters
    num   = @ems.number_of(:ems_clusters)
    h     = {:label => label, :icon => "pficon pficon-cluster", :value => num}
    if num > 0 && role_allows?(:feature => "ems_cluster_show_list")
      h[:link] = ems_infra_path(@ems.id, :display => 'ems_clusters', :vat => true)
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_hosts
    label = title_for_hosts
    num   = @ems.number_of(:hosts)
    h     = {:label => label, :icon => "pficon pficon-screen", :value => num}
    if num > 0 && role_allows?(:feature => "host_show_list")
      h[:link]  = ems_infra_path(@ems.id, :display => 'hosts')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_used_tenants
    return nil if !@record.respond_to?(:cloud_tenants) || !@record.cloud_tenants

    textual_link(@record.cloud_tenants,
                 :as   => CloudTenant,
                 :link => ems_infra_path(@record.id, :display => 'cloud_tenants'))
  end

  def textual_used_availability_zones
    return nil if !@record.respond_to?(:availability_zones) || !@record.availability_zones

    textual_link(@record.availability_zones,
                 :as   => AvailabilityZone,
                 :link => ems_infra_path(@record.id, :display => 'availability_zones'))
  end

  def textual_ems_cloud
    return nil unless @record.provider.respond_to?(:cloud_ems)

    textual_link(@record.provider.try(:cloud_ems).first)
  end

  def textual_datastores
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)

    textual_link(@record.storages.sort_by { |s| s.name.downcase },
                 :as   => Storage,
                 :link => ems_infra_path(@record.id, :display => 'storages'))
  end

  def textual_vms
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)

    textual_link(@ems.vms, :label => _("Virtual Machines"))
  end

  def textual_templates
    textual_link(@ems.miq_templates, :label => _("Templates"))
  end

  def textual_orchestration_stacks_status
    return nil if !@ems.respond_to?(:orchestration_stacks) || !@ems.orchestration_stacks

    label         = _("States of Root Orchestration Stacks")
    stacks_states = @ems.direct_orchestration_stacks.collect { |x| "#{x.name} status: #{x.status}" }.join(", ")

    {:label => label, :value => stacks_states}
  end

  def textual_orchestration_stacks
    return nil unless @ems.respond_to?(:orchestration_stacks)

    @ems.orchestration_stacks
  end

  def textual_zone
    {:label => _("Managed by Zone"), :icon => "pficon pficon-zone", :value => @ems.zone}
  end

  def textual_host_default_vnc_port_range
    return nil if @ems.host_default_vnc_port_start.blank?
    value = "#{@ems.host_default_vnc_port_start} - #{@ems.host_default_vnc_port_end}"
    {:label => _("%{title} Default VNC Port Range") % {:title => title_for_host}, :value => value}
  end

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => url_for(:controller => '/physical_infra_topology', :action => 'show', :id => @record.id),
     :title => _("Show topology")}
  end
end

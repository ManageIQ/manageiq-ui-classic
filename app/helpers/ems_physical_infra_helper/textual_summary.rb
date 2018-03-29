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
      %i(physical_switches physical_servers datastores vms physical_servers_with_host)
    )
  end

  def textual_group_status
    TextualGroup.new(
      _("Status"),
      textual_authentications(@record.authentication_userid_passwords) + %i(refresh_status refresh_date)
    )
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i(zone tags))
  end

  def textual_group_topology
    TextualGroup.new(_("Overview"), %i(topology))
  end

  #
  # Items
  #

  def textual_hostname
    @record.hostname
  end

  def textual_ipaddress
    {:label => _("Discovered IP Address"), :value => @record.ipaddress}
  end

  def textual_type
    {:label => _("Type"), :value => @record.emstype_description}
  end

  def textual_port
    @record.supports_port? ? {:label => _("API Port"), :value => @record.port} : nil
  end

  def textual_physical_switches
    textual_link(@record.physical_switches)
  end

  def textual_physical_servers
    available = @record.number_of(:physical_servers) > 0
    h = {:label => _("Physical Servers"), :icon => "pficon pficon-server", :value => @record.number_of(:physical_servers)}
    if available
      h[:link] = "/ems_physical_infra/#{@record.id}?display=physical_servers"
    end
    h
  end

  def textual_physical_servers_with_host
    count_of_host_relationships = (@record.physical_servers.select { |server| !server.host.nil? }).length
    h = {:label => _("Physical Servers with Host"), :icon => "pficon pficon-server", :value => count_of_host_relationships}
    if count_of_host_relationships > 0
      h[:link] = "/ems_physical_infra/#{@record.id}?display=physical_servers_with_host"
    end
    h
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_datastores
    return nil if @record.kind_of?(ManageIQ::Providers::PhysicalInfraManager)

    textual_link(@record.storages.sort_by { |s| s.name.downcase },
                 :as   => Storage,
                 :link => ems_physical_infra_path(@record.id, :display => 'storages'))
  end

  def textual_vms
    return nil if @record.kind_of?(ManageIQ::Providers::PhysicalInfraManager)

    textual_link(@record.vms, :label => _("Virtual Machines"))
  end

  def textual_zone
    {:label => _("Managed by Zone"), :icon => "pficon pficon-zone", :value => @record.zone.name}
  end

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => url_for(:controller => '/physical_infra_topology', :action => 'show', :id => @record.id),
     :title => _("Show topology")}
  end
end

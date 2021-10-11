module EmsPhysicalInfraHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  include TextualMixins::TextualCustomButtonEvents
  include TextualMixins::TextualZone
  include TextualMixins::EmsCommon
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[hostname type port guid]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        datastores physical_chassis physical_racks physical_servers physical_servers_with_host
        physical_storages physical_switches vms custom_button_events
      ]
    )
  end

  def textual_group_status
    TextualGroup.new(
      _("Status"),
      textual_authentications(@record.authentication_userid_passwords) + %i[refresh_status refresh_date]
    )
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[zone tags])
  end

  def textual_group_topology
    TextualGroup.new(_("Overview"), %i[topology])
  end

  #
  # Items
  #

  def textual_hostname
    @record.hostname
  end

  def textual_type
    {:label => _("Type"), :value => @record.emstype_description}
  end

  def textual_port
    @record.supports?(:port) ? {:label => _("API Port"), :value => @record.port} : nil
  end

  def textual_physical_racks
    textual_link(@record.physical_racks)
  end

  def textual_physical_chassis
    textual_link(@record.physical_chassis)
  end

  def textual_physical_switches
    textual_link(@record.physical_switches, :as => PhysicalSwitch)
  end

  def textual_physical_storages
    textual_link(@record.physical_storages)
  end

  def textual_physical_servers
    available = @record.number_of(:physical_servers).positive?
    h = {:label => _("Physical Servers"), :icon => PhysicalServer.decorate.fonticon, :value => @record.number_of(:physical_servers)}
    if available
      h[:link] = "/ems_physical_infra/#{@record.id}?display=physical_servers"
    end
    h
  end

  def textual_physical_servers_with_host
    count_of_host_relationships = (@record.physical_servers.reject { |server| server.host.nil? }).length
    h = {:label => _("Physical Servers with Host"), :icon => PhysicalServer.decorate.fonticon, :value => count_of_host_relationships}
    if count_of_host_relationships.positive?
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

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => url_for(:controller => '/physical_infra_topology', :action => 'show', :id => @record.id),
     :title => _("Show topology")}
  end
end

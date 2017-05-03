module EmsPhysicalInfraHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i(hostname type port guid)
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
      _("Status"),
      textual_authentications(@record.authentication_userid_passwords) + %i(refresh_status)
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

  def textual_hostname
    @record.hostname
  end

  def textual_type
    {:label => _("Type"), :value => @record.emstype_description}
  end

  def textual_port
    @record.supports_port? ? {:label => _("API Port"), :value => @record.port} : nil
  end

  def textual_physical_servers
    available = @record.number_of(:physical_servers) > 0
    h = {:label =>  _("Physical Servers"), :icon  =>  "pficon pficon-server", :value => @ems.number_of(:physical_servers)}
    if available
      h[:link] = "/ems_physical_infra/#{@ems.id}?display=physical_servers"
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

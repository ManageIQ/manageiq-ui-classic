module EmsInfraHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  include TextualMixins::TextualZone
  include TextualMixins::EmsCommon
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[hostname ipaddress type port cpu_resources memory_resources cpus cpu_cores guid host_default_vnc_port_range]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[clusters hosts datastores vms templates orchestration_stacks ems_cloud network_manager custom_button_events tenant]
    )
  end

  def textual_group_status
    TextualGroup.new(
      _("Status"),
      textual_authentications(@record.authentication_userid_passwords) + %i[refresh_status refresh_date orchestration_stacks_status]
    )
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[zone tags])
  end

  def textual_group_topology
    items = %w[topology]
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact
    TextualGroup.new(_("Overview"), i)
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

  def textual_cpu_resources
    {:label => _("Aggregate %{title} CPU Resources") % {:title => title_for_host},
     :value => mhz_to_human_size(@record.aggregate_cpu_speed)}
  end

  def textual_memory_resources
    {:label => _("Aggregate %{title} Memory") % {:title => title_for_host},
     :value => number_to_human_size(@record.aggregate_memory * 1.megabyte, :precision => 0)}
  end

  def textual_cpus
    {:label => _("Aggregate %{title} CPUs") % {:title => title_for_host}, :value => @record.aggregate_physical_cpus}
  end

  def textual_cpu_cores
    {:label => _("Aggregate %{title} CPU Cores") % {:title => title_for_host},
     :value => @record.aggregate_cpu_total_cores}
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_clusters
    label = title_for_clusters
    num   = @record.number_of(:ems_clusters)
    h     = {:label => label, :icon => "pficon pficon-cluster", :value => num}
    if num.positive? && role_allows?(:feature => "ems_cluster_show_list")
      h[:link] = ems_infra_path(@record.id, :display => 'ems_clusters', :vat => true)
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_hosts
    label = title_for_hosts
    num   = @record.number_of(:hosts)
    h     = {:label => label, :icon => "pficon pficon-container-node", :value => num}
    if num.positive? && role_allows?(:feature => "host_show_list")
      h[:link]  = ems_infra_path(@record.id, :display => 'hosts')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_ems_cloud
    return nil unless @record.provider.respond_to?(:cloud_ems)

    textual_link(@record.provider.try(:cloud_ems).first)
  end

  def textual_network_manager
    return nil unless @record.ext_management_system.respond_to?(:network_manager)

    textual_link(@record.ext_management_system.try(:network_manager))
  end

  def textual_datastores
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)

    textual_link(@record.storages.sort_by { |s| s.name.downcase },
                 :as   => Storage,
                 :link => ems_infra_path(@record.id, :display => 'storages'))
  end

  def textual_vms
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)

    textual_link(@record.vms, :label => _("Virtual Machines"))
  end

  def textual_templates
    textual_link(@record.miq_templates, :label => _("Templates"))
  end

  def textual_orchestration_stacks_status
    return nil if !@record.respond_to?(:orchestration_stacks) || !@record.orchestration_stacks

    label         = _("States of Root Orchestration Stacks")
    stacks_states = @record.direct_orchestration_stacks.collect { |x| "#{x.name} status: #{x.status}" }.join(", ")

    {:label => label, :value => stacks_states}
  end

  def textual_orchestration_stacks
    return nil unless @record.respond_to?(:orchestration_stacks)

    @record.orchestration_stacks
  end

  def textual_host_default_vnc_port_range
    return nil if @record.host_default_vnc_port_start.blank?
    value = "#{@record.host_default_vnc_port_start} - #{@record.host_default_vnc_port_end}"
    {:label => _("%{title} Default VNC Port Range") % {:title => title_for_host}, :value => value}
  end

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => url_for_only_path(:controller => '/infra_topology', :action => 'show', :id => @record.id),
     :title => _("Show topology")}
  end

  def textual_custom_button_events
    return nil unless User.current_user.super_admin_user? || User.current_user.admin?

    {
      :label => _('Custom Button Events'),
      :value => num = @record.number_of(:custom_button_events),
      :link  => num.positive? ? ems_infra_path(:id => @record, :display => 'custom_button_events') : nil,
      :icon  => CustomButtonEvent.decorate.fonticon,
    }
  end

  def textual_tenant
    return nil unless User.current_user.super_admin_user?

    {:label => _('Tenant'), :value => @record.tenant.name}
  end
end

module EmsClusterHelper::TextualSummary
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_host_totals
    TextualGroup.new(
      _("Totals for %{hosts}") % {:hosts => title_for_hosts},
      %i[
        aggregate_cpu_speed aggregate_memory aggregate_physical_cpus aggregate_cpu_total_cores
        aggregate_disk_capacity block_storage_disk_usage object_storage_disk_usage
      ]
    )
  end

  def textual_group_vm_totals
    TextualGroup.new(_("Totals for VMs"), %i[aggregate_vm_memory aggregate_vm_cpus])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems parent_datacenter total_hosts total_direct_vms allvms_size total_miq_templates
        rps_size states_size custom_button_events
      ]
    )
  end

  def textual_group_configuration
    return nil if @record.ha_enabled.nil? && @record.ha_admit_control.nil? && @record.drs_enabled.nil? &&
                  @record.drs_automation_level.nil? && @record.drs_migration_threshold.nil?
    TextualGroup.new(
      _("Configuration"),
      %i[ha_enabled ha_admit_control drs_enabled drs_automation_level drs_migration_threshold]
    )
  end

  def textual_group_openstack_status
    return nil unless @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Cluster)
    ret = textual_generate_openstack_status

    ret.blank? ? nil : TextualMultilink.new(_("OpenStack Status"), :items => ret)
  end

  #
  # Items
  #

  def textual_generate_openstack_status
    @record.service_group_names.collect do |x|
      running_count = @record.host_ids_with_running_service_group(x.name).count
      failed_count  = @record.host_ids_with_failed_service_group(x.name).count
      all_count     = @record.host_ids_with_service_group(x.name).count

      running = {:title => _("Show list of hosts with running %{name}") % {:name => x.name},
                 :value => _("Running (%{number})") % {:number => running_count},
                 :icon  => failed_count.zero? && running_count.positive? ? 'pficon pficon-ok' : nil,
                 :link  => if running_count.positive?
                             url_for_only_path(:controller              => controller.controller_name,
                                               :action                  => 'show',
                                               :id                      => @record,
                                               :display                 => 'hosts',
                                               :host_service_group_name => x.name,
                                               :status                  => :running)
                           end}

      failed = {:title => _("Show list of hosts with failed %{name}") % {:name => x.name},
                :value => _("Failed (%{number})") % {:number => failed_count},
                :icon  => failed_count.positive? ? 'pficon pficon-error-circle-o' : nil,
                :link  => if failed_count.positive?
                            url_for_only_path(:controller              => controller.controller_name,
                                              :action                  => 'show',
                                              :id                      => @record,
                                              :display                 => 'hosts',
                                              :host_service_group_name => x.name,
                                              :status                  => :failed)
                          end}

      all = {:title => _("Show list of hosts with %{name}") % {:name => x.name},
             :value => _("All (%{number})") % {:number => all_count},
             :icon  => 'pficon pficon-container-node',
             :link  => if all_count.positive?
                         url_for_only_path(:controller              => controller.controller_name,
                                           :action                  => 'show',
                                           :display                 => 'hosts',
                                           :id                      => @record,
                                           :host_service_group_name => x.name,
                                           :status                  => :all)
                       end}

      sub_items = [running, failed, all]

      {:value => x.name, :sub_items => sub_items}
    end
  end

  def textual_aggregate_cpu_speed
    {:label => _("Total CPU Resources"), :value => mhz_to_human_size(@record.aggregate_cpu_speed).to_s}
  end

  def textual_aggregate_memory
    {:label => _("Total Memory"), :value => number_to_human_size(@record.aggregate_memory.megabytes, :precision => 2)}
  end

  def textual_aggregate_physical_cpus
    {:label => _("Total CPUs"), :value => number_with_delimiter(@record.aggregate_physical_cpus)}
  end

  def textual_aggregate_cpu_total_cores
    {:label => _("Total %{title} CPU Cores") % {:title => title_for_host},
     :value => number_with_delimiter(@record.aggregate_cpu_total_cores)}
  end

  def textual_aggregate_vm_memory
    {:label => _("Total Configured Memory"),
     :value => _("%{number} (Virtual to Real Ratio: %{ratio})") %
       {:number => number_to_human_size(@record.aggregate_vm_memory.megabytes, :precision => 2),
        :ratio  => @record.v_ram_vr_ratio.round(2)}}
  end

  def textual_aggregate_vm_cpus
    {:label => _("Total Configured CPUs"),
     :value => _("%{number} (Virtual to Real Ratio: %{ratio})") %
       {:number => number_with_delimiter(@record.aggregate_vm_cpus),
        :ratio  => @record.v_cpu_vr_ratio.round(2)}}
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_parent_datacenter
    {:label => _("Datacenter"), :icon => "fa fa-building-o", :value => @record.v_parent_datacenter || _("None")}
  end

  def textual_total_hosts
    num = @record.total_hosts
    h = {:label => title_for_hosts, :icon => "pficon pficon-container-node", :value => num}
    if num.positive? && role_allows?(:feature => "host_show_list")
      h[:title] = _("Show all %{title}") % {:title => title_for_hosts}
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => @record, :display => 'hosts')
    end
    h
  end

  def textual_total_direct_vms
    num = @record.total_direct_vms
    h = {:label => _("Direct VMs"), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:title] = _("Show VMs in this Cluster, but not in Resource Pools below")
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => @record, :display => 'vms')
    end
    h
  end

  def textual_allvms_size
    num = @record.total_vms
    h = {:label => _("All VMs"), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:title] = _("Show all VMs in this Cluster")
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => @record, :display => 'all_vms')
    end
    h
  end

  def textual_total_miq_templates
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Cluster)

    num = @record.total_miq_templates
    h = {:label => _("All Templates"), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "miq_template_show_list")
      h[:title] = _("Show all Templates in this Cluster")
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => @record, :display => 'miq_templates')
    end
    h
  end

  def textual_rps_size
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Cluster)

    textual_link(@record.resource_pools,
                 :as   => ResourcePool,
                 :link => url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => @record, :display => 'resource_pools'))
  end

  def textual_states_size
    return nil unless role_allows?(:feature => "ems_cluster_drift")
    num = @record.number_of(:drift_states)
    h = {:label => _("Drift History"), :icon => "ff ff-drift", :value => (num.zero? ? _("None") : num)}
    if num.positive?
      h[:title] = _("Show Cluster drift history")
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'drift_history', :id => @record)
    end
    h
  end

  def textual_ha_enabled
    value = @record.ha_enabled
    return nil if value.nil?
    {:label => _("HA Enabled"), :value => value}
  end

  def textual_ha_admit_control
    value = @record.ha_admit_control
    return nil if value.nil?
    {:label => _("HA Admit Control"), :value => value}
  end

  def textual_drs_enabled
    value = @record.drs_enabled
    return nil if value.nil?
    {:label => _("DRS Enabled"), :value => value}
  end

  def textual_drs_automation_level
    value = @record.drs_automation_level
    return nil if value.nil?
    {:label => _("DRS Automation Level"), :value => value}
  end

  def textual_drs_migration_threshold
    value = @record.drs_migration_threshold
    return nil if value.nil?
    {:label => _("DRS Migration Threshold"), :value => value}
  end

  def textual_aggregate_disk_capacity
    {:value => number_to_human_size(@record.aggregate_disk_capacity.gigabytes, :precision => 2), :label => _('Aggregate disk capacity')}
  end

  def textual_block_storage_disk_usage
    return nil unless @record.respond_to?(:block_storage?) && @record.block_storage? && !@record.cloud.nil?
    {:value => number_to_human_size(@record.cloud_block_storage_disk_usage.bytes, :precision => 2)}
  end

  def textual_object_storage_disk_usage
    return nil unless @record.respond_to?(:object_storage?) && @record.object_storage? && !@record.cloud.nil?
    {:value => number_to_human_size(@record.cloud_object_storage_disk_usage.bytes, :precision => 2)}
  end
end

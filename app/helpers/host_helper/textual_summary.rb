module HostHelper::TextualSummary
  include TextualMixins::TextualCustomButtonEvents
  include TextualMixins::TextualDevices
  include TextualMixins::TextualOsInfo
  include TextualMixins::TextualVmmInfo
  include TextualMixins::TextualPowerState
  # TODO: Determine if DoNav + url_for + :title is the right way to do links, or should it be link_to with :title

  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        hostname region ipaddress ipmi_ipaddress ipmi_enabled hypervisor_hostname custom_1 vmm_info vmm_version vmm_buildnumber model asset_tag service_tag osinfo
        power_state lockdown_mode maintenance_mode devices network storage_adapters num_cpu num_cpu_cores
        cpu_cores_per_socket memory guid
      ]
    )
  end

  def textual_group_relationships
    additions = []
    additions.push(:cloud_networks) if @record.respond_to?(:cloud_networks)
    additions.push(:cloud_subnets) if @record.respond_to?(:cloud_subnets)
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems cluster availability_zone used_tenants storages resource_pools vms templates drift_history
        physical_server network_manager custom_button_events
      ] + additions
    )
  end

  def textual_group_security
    return nil if @record.is_vmware_esxi?

    TextualGroup.new(_("Security"), %i[users groups patches firewall_rules ssh_root])
  end

  def textual_group_configuration
    TextualGroup.new(_("Configuration"), %i[guest_applications host_services filesystems advanced_settings])
  end

  def textual_group_diagnostics
    return nil unless ::Settings.product.proto

    TextualGroup.new(_("Diagnostics"), %i[esx_logs])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_group_miq_custom_attributes
    TextualGroup.new(_("Custom Attributes"), textual_miq_custom_attributes)
  end

  def textual_group_ems_custom_attributes
    TextualGroup.new(_("VC Custom Attributes"), textual_ems_custom_attributes)
  end

  def textual_group_authentications
    TextualGroup.new(
      _("Authentication Status"),
      textual_authentications(@record.authentication_userid_passwords + @record.authentication_key_pairs)
    )
  end

  def textual_group_cloud_services
    return nil unless @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    TextualGroup.new(_("Cloud Services"), textual_openstack_nova_scheduler)
  end

  def textual_group_openstack_service_status
    return nil unless @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    TextualMultilink.new(_("OpenStack Service Status"), :items => textual_generate_openstack_status)
  end

  def textual_group_openstack_hardware_status
    return nil unless @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    TextualGroup.new(_("Openstack Hardware"), %i[introspected provision_state])
  end

  #
  # Items
  #

  def textual_generate_openstack_status
    @record.host_service_group_openstacks.collect do |x|
      running_count       = x.running_system_services.count
      failed_count        = x.failed_system_services.count
      all_count           = x.system_services.count
      configuration_count = x.filesystems.count

      running = {:title => _("Show list of running %{name}") % {:name => x.name},
                 :value => _("Running (%{number})") % {:number => running_count},
                 :icon  => failed_count.zero? && running_count.positive? ? 'pficon pficon-ok' : nil,
                 :link  => running_count.positive? ? host_service_link(x, 'host_services', :running) : nil}

      failed = {:title => _("Show list of failed %{name}") % {:name => x.name},
                :value => _("Failed (%{number})") % {:number => failed_count},
                :icon  => failed_count.positive? ? 'pficon pficon-error-circle-o' : nil,
                :link  => failed_count.positive? ? host_service_link(x, 'host_services', :failed) : nil}

      all = {:title => _("Show list of all %{name}") % {:name => x.name},
             :value => _("All (%{number})") % {:number => all_count},
             :icon  => 'pficon pficon-service',
             :link  => all_count.positive? ? host_service_link(x, 'host_services', :all) : nil}

      configuration = {:title => _("Show list of configuration files of %{name}") % {:name => x.name},
                       :icon  => 'fa fa-file-o',
                       :value => _("Configuration (%{number})") % {:number => configuration_count},
                       :link  => configuration_count.positive? ? host_service_link(x, 'filesystems') : nil}

      sub_items = [running, failed, all, configuration]

      {:value => x.name, :sub_items => sub_items}
    end
  end

  def host_service_link(record, action, status = nil)
    args = {:controller         => controller.controller_name,
            :action             => action,
            :id                 => @record,
            :db                 => controller.controller_name,
            :host_service_group => record.id}
    args[:status] = status if status.present?
    url_for_only_path(args)
  end

  def textual_hostname
    {:label => _('Hostname'), :value => @record.hostname}
  end

  def textual_ipaddress
    {:label => _("IP Address"), :value => @record.ipaddress.to_s}
  end

  def textual_ipmi_ipaddress
    {:label => _("IPMI IP Address"), :value => @record.ipmi_address.to_s}
  end

  def textual_ipmi_enabled
    {:label => _("IPMI Enabled"), :value => @record.ipmi_enabled.to_s}
  end

  def textual_vmm_version
    {:label => _("VMM Version"), :value => @record.vmm_version}
  end

  def textual_vmm_buildnumber
    {:label => _("VMM Build"), :value => @record.vmm_buildnumber}
  end

  def textual_region
    {:label => _("Region"), :value => @record.region_description}
  end

  def textual_hypervisor_hostname
    {:label => _("Hypervisor Hostname"), :value => @record.hypervisor_hostname.to_s}
  end

  def textual_custom_1
    return nil if @record.custom_1.blank?

    label = _("Custom Identifier")
    h     = {:label => label, :value => @record.custom_1}
    h
  end

  def textual_model
    h = {:label => _("Manufacturer / Model")}
    h[:value] = if !@record.hardware.nil? && (@record.hardware.manufacturer.present? || @record.hardware.model.present?)
                  "#{@record.hardware.manufacturer} / #{@record.hardware.model}"
                else
                  _("N/A")
                end
    h
  end

  def textual_asset_tag
    {:label => _('Asset tag'), :icon => "fa fa-tag", :value => @record.asset_tag}
  end

  def textual_service_tag
    {:label => _('Service tag'), :icon => "fa fa-tag", :value => @record.service_tag}
  end

  def textual_power_state
    textual_power_state_whitelisted(@record.state)
  end

  def textual_lockdown_mode
    {:label => _("Lockdown Mode"), :value => @record.admin_disabled ? _("Enabled") : _("Disabled")}
  end

  def textual_maintenance_mode
    {:label => _("Maintenance Mode"), :value => @record.maintenance ? _("Enabled") : _("Disabled")}
  end

  def textual_storage_adapters
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    num = @record.hardware.nil? ? 0 : @record.hardware.number_of(:storage_adapters)
    h = {:label => _("Storage Adapters"), :icon => "ff ff-network-card", :value => num}
    if num.positive?
      h[:title] = _("Show Host Storage Adapters")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'storage_adapters')
    end
    h
  end

  def textual_network
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    num = @record.number_of(:switches)
    h = {:label => _("Network"), :icon => "pficon pficon-network", :value => (num.zero? ? _("N/A") : _("Available"))}
    if num.positive?
      h[:title] = _("Show Host Network")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'network')
    end
    h
  end

  def textual_cloud_networks
    return nil unless @record.ext_management_system.respond_to?(:cloud_networks)

    textual_link(@record.cloud_networks)
  end

  def textual_cloud_subnets
    return nil unless @record.ext_management_system.respond_to?(:cloud_subnets)

    textual_link(@record.cloud_subnets)
  end

  def textual_num_cpu
    {:label => _("Number of CPUs"), :icon => "pficon pficon-cpu", :value => @record.hardware.nil? ? _("N/A") : @record.hardware.cpu_sockets}
  end

  def textual_num_cpu_cores
    {:label => _("Number of CPU Cores"), :icon => "pficon pficon-cpu", :value => @record.hardware.nil? ? _("N/A") : @record.hardware.cpu_total_cores}
  end

  def textual_cpu_cores_per_socket
    {:label => _("CPU Cores Per Socket"), :icon => "pficon pficon-cpu",
     :value => @record.hardware.nil? ? _("N/A") : @record.hardware.cpu_cores_per_socket}
  end

  def textual_memory
    {:label => _("Memory"), :icon => "pficon pficon-memory",
     :value => if @record.hardware.nil? || !@record.hardware.memory_mb.kind_of?(Numeric)
                 _("N/A")
               else
                 number_to_human_size(@record.hardware.memory_mb.to_i * 1.megabyte, :precision => 0)
               end}
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_cluster
    cluster = @record.ems_cluster
    h = {:label => _("Cluster"), :icon => "pficon pficon-cluster", :value => (cluster.nil? ? _("None") : cluster.name)}
    if cluster && role_allows?(:feature => "ems_cluster_show")
      h[:title] = _("Show this Host's Cluster")
      h[:link]  = url_for_only_path(:controller => 'ems_cluster', :action => 'show', :id => cluster)
    end
    h
  end

  def textual_physical_server
    if @record.physical_server_id.nil?
      {:label => _("Physical Server"), :value => _("None"), :icon => PhysicalServer.decorate.fonticon}
    else
      {
        :label => _("Physical Server"),
        :value => @record.physical_server.try(:name),
        :icon  => PhysicalServer.decorate.fonticon,
        :link  => url_for(:controller => 'physical_server', :action => 'show', :id => @record.physical_server_id)
      }
    end
  end

  def textual_network_manager
    return nil unless @record.ext_management_system.respond_to?(:network_manager)

    textual_link(@record.ext_management_system.try(:network_manager))
  end

  def textual_storages
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    textual_link(@record.storages)
  end

  def textual_resource_pools
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    textual_link(@record.resource_pools,
                 :as   => ResourcePool,
                 :link => url_for_only_path(:action => 'show', :id => @record, :display => 'resource_pools'))
  end

  def textual_drift_history
    return nil unless role_allows?(:feature => "host_drift")

    label = _("Drift History")
    num   = @record.number_of(:drift_states)
    h     = {:label => label, :icon => "ff ff-drift", :value => num}
    if num.positive?
      h[:title] = _("Show all %{label}") % {:label => label}
      h[:link]  = url_for_only_path(:action => 'drift_history', :id => @record)
    end
    h
  end

  def textual_availability_zone
    return nil unless @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    availability_zone = @record.availability_zone
    h = {:label => _('Availability Zone'),
         :icon  => "pficon pficon-zone",
         :value => (availability_zone.nil? ? _("None") : availability_zone.name)}
    if availability_zone && role_allows?(:feature => "availability_zone_show")
      h[:title] = _("Show this Host's Availability Zone")
      h[:link]  = url_for_only_path(:controller => 'availability_zone', :action => 'show', :id => availability_zone)
    end
    h
  end

  def textual_used_tenants
    return nil unless @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    textual_link(@record.cloud_tenants,
                 :as   => CloudTenant,
                 :link => url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_tenants'))
  end

  def textual_vms
    label = _("VMs")
    num   = @record.number_of(:vms)
    h     = {:label => label, :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:title] = _("Show all %{label}") % {:label => label}
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'vms')
    end
    h
  end

  def textual_templates
    return nil if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)

    textual_link(@record.miq_templates, :label => _('Templates'))
  end

  def textual_compliance_history
    super(:title => _("Show Compliance History of this Host (Last 10 Checks)"))
  end

  def textual_users
    return nil if @record.is_vmware_esxi?

    num = @record.number_of(:users)
    h = {:label => _("Users"), :icon => "pficon pficon-user", :value => num}
    if num.positive?
      h[:title] = n_("Show the User defined on this VM", "Show the Users defined on this VM", num)
      h[:link]  = url_for_only_path(:action => 'users', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_groups
    return nil if @record.is_vmware_esxi?

    num = @record.number_of(:groups)
    h = {:label => _("Groups"), :icon => "ff ff-group", :value => num}
    if num.positive?
      h[:title] = n_("Show the Group defined on this Host", "Show the Groups defined on this Host", num)
      h[:link]  = url_for_only_path(:action => 'groups', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_firewall_rules
    return nil if @record.is_vmware_esxi?

    num = @record.number_of(:firewall_rules)
    h = {:label => _("Firewall Rules"), :icon => "ff ff-firewall", :value => num}
    if num.positive?
      h[:title] = n_("Show the Firewall Rule defined on this Host", "Show the Firewall Rules defined on this Host", num)
      h[:link]  = url_for_only_path(:action => 'firewall_rules', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_ssh_root
    return nil if @record.is_vmware_esxi?

    {:label => _("SSH Root"), :value => @record.ssh_permit_root_login}
  end

  def textual_patches
    return nil if @record.is_vmware_esxi?

    num = @record.number_of(:patches)
    h = {:label => _("Patches"), :icon => "fa fa-shield", :value => num}
    if num.positive?
      h[:title] = n_("Show the Patch defined on this Host", "Show the Patches defined on this Host", num)
      h[:link]  = url_for_only_path(:action => 'patches', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_guest_applications
    num = @record.number_of(:guest_applications)
    h = {:label => _("Packages"), :icon => "ff ff-software-package", :value => num}
    if num.positive?
      h[:title] = n_("Show the Package installed on this Host",
                     "Show the Packages installed on this Host", num)
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'guest_applications', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_host_services
    num = @record.number_of(:host_services)
    h = {:label => _("Services"), :icon => "pficon pficon-service", :value => num}
    if num.positive?
      h[:title] = n_("Show the Service installed on this Host",
                     "Show the Services installed on this Host", num)
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'host_services', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_filesystems
    num = @record.number_of(:filesystems)
    h = {:label => _("Files"), :icon => "fa fa-file-o", :value => num}
    if num.positive?
      h[:title] = n_("Show the File installed on this Host", "Show the Files installed on this Host", num)
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'filesystems', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_advanced_settings
    num = @record.number_of(:advanced_settings)
    h = {:label => _("Advanced Settings"), :icon => "pficon pficon-settings", :value => num}
    if num.positive?
      h[:title] = n_("Show the Advanced Setting installed on this Host", "Show the Advanced Settings installed on this Host", num)
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'advanced_settings', :id => @record, :db => controller.controller_name)
    end
    h
  end

  def textual_esx_logs
    num = @record.operating_system.nil? ? 0 : @record.operating_system.number_of(:event_logs)
    h = {:label => _("ESX Logs"), :icon => "fa fa-file-text-o", :value => (num.zero? ? _("Not Available") : _("Available"))}
    if num.positive?
      h[:title] = _("Show Host Network")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'event_logs')
    end
    h
  end

  def textual_miq_custom_attributes
    attrs = @record.miq_custom_attributes
    return nil if attrs.blank?

    attrs.sort_by(&:name).collect { |a| {:label => a.name, :value => a.value} }
  end

  def textual_ems_custom_attributes
    attrs = @record.ems_custom_attributes
    return nil if attrs.blank?

    attrs.sort_by { |a| a.name.to_s }.collect { |a| {:label => a.name, :value => a.value} }
  end

  def textual_openstack_nova_scheduler
    {:label => _("Openstack Nova Scheduler"), :value => openstack_nova_scheduler_value,
     :link => url_for_only_path(:controller => controller.controller_name, :action => 'host_cloud_services', :id => @record)}
  end

  def openstack_nova_scheduler_value
    return _("Not available. Did you assigned Cloud Provider and run SSA?") if @record.cloud_services.empty?
    "%{enabled_cnt} Enabled / %{disabled_cnt} Disabled " % {
      :enabled_cnt  => @record.cloud_services.where(:scheduling_disabled => false).count,
      :disabled_cnt => @record.cloud_services.where(:scheduling_disabled => true).count
    }
  end

  def textual_introspected
    {:label => _("Introspected"), :value => @record.hardware.introspected}
  end

  def textual_provision_state
    {:label => _("Provisioning State"), :value => @record.hardware.provision_state}
  end
end

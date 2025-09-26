module Menu
  class DefaultMenu
    class << self
      def default_menu
        [
          # user, group switcher & find are NOT part of the menu
          overview_menu_section,
          services_menu_section,

          # items with Providers
          compute_menu_section,
          network_menu_section,
          storage_menu_section,
          automation_menu_section,

          control_menu_section,

          settings_menu_section,
          logout_item,
        ]
      end

      def compute_menu_section
        Menu::Section.new(:compute, N_("Compute"), 'carbon--Chip', [
          clouds_menu_section,
          infrastructure_menu_section,
          physical_infrastructure_menu_section,
          container_menu_section,
        ])
      end

      def configuration_menu_section
        Menu::Section.new(:conf, N_("Configuration"), 'carbon--InventoryManagement', [
          Menu::Item.new('ems_configuration',     N_('Providers'),          'ems_configuration',     {:feature => 'ems_configuration_show_list'},     '/ems_configuration/show_list'),
          Menu::Item.new('configuration_profile', N_('Profiles'),           'configuration_profile', {:feature => 'configuration_profile_show_list'}, '/configuration_profile/show_list'),
          Menu::Item.new('configured_system',     N_('Configured Systems'), 'configured_system',     {:feature => 'configured_system_show_list'},     '/configured_system/show_list'),
        ])
      end

      def overview_menu_section
        Menu::Section.new(:vi, N_("Overview"), 'carbon--Cloud', [
          Menu::Item.new('dashboard',  N_('Dashboard'),  'dashboard',  {:feature => 'dashboard_view'},           '/dashboard/show'),
          Menu::Item.new('report',     N_('Reports'),    'miq_report', {:feature => 'miq_report', :any => true}, '/report/explorer'),
          # Menu::Item.new('usage',    N_('Usage'),      'usage',      {:feature => 'usage'},                    '/report/usage/'), #  / Hiding usage for now - release 5.2
          Settings.product.consumption ? consumption_menu_section : nil,
          Menu::Item.new('miq_capacity_utilization', N_('Utilization'), 'utilization', {:feature => 'utilization'}, '/utilization'),
          chargeback_menu_section,
          Menu::Item.new('optimization', N_('Optimization'), 'optimization', {:feature => 'optimization'}, '/optimization'),
        ])
      end

      # FIXME: remove?
      def consumption_menu_section
        Menu::Section.new(:cons, N_("Consumption"), nil, [
          Menu::Item.new('consumption', N_('Dashboard'), 'consumption', {:feature => 'consumption', :any => true}, '/consumption/show')
        ])
      end

      def services_menu_section
        Menu::Section.new(:svc, N_("Services"), 'carbon--ToolBox', [
                            Menu::Item.new('services', N_('My Services'), 'service', {:feature => 'service_show_list'}, '/service/show_list'),
                            Menu::Item.new('catalogs',       N_('Catalogs'),    'catalog',     {:feature => 'catalog', :any => true},     '/catalog/explorer'),
                            Menu::Item.new('vm_or_template', N_('Workloads'),   'vm_explorer', {:feature => 'vm_explorer', :any => true}, '/vm_or_template/explorer'),
                            Menu::Item.new('miq_request_vm', N_('Requests'),    'miq_request', {:feature => 'miq_request_show_list'},     '/miq_request/show_list?typ=service')
                          ])
      end

      def chargeback_menu_section
        Menu::Section.new(:chargeback, N_("Chargeback"), nil, [
          Menu::Item.new('chargeback_report',     N_('Reports'),     'chargeback_reports',     {:feature => 'chargeback_reports_show_list', :any => true}, '/chargeback_report/show_list'),
          Menu::Item.new('chargeback_rate',       N_('Rates'),       'chargeback_rates',       {:feature => 'chargeback_rates_show_list',   :any => true}, '/chargeback_rate/show_list'),
          Menu::Item.new('chargeback_assignment', N_('Assignments'), 'chargeback_assignments', {:feature => 'chargeback_assignments'},                     '/chargeback_assignment'),
        ])
      end

      def clouds_menu_section
        Menu::Section.new(:clo, N_("Clouds"), nil, [
          Menu::Item.new('ems_cloud',           N_('Providers'),          'ems_cloud',           {:feature => 'ems_cloud_show_list'},             '/ems_cloud/show_list'),
          Menu::Item.new('availability_zone',   N_('Availability Zones'), 'availability_zone',   {:feature => 'availability_zone_show_list'},     '/availability_zone/show_list'),
          Menu::Item.new('host_aggregate',      N_('Host Aggregates'),    'host_aggregate',      {:feature => 'host_aggregate_show_list'},        '/host_aggregate/show_list'),
          Menu::Item.new('cloud_tenant',        N_('Tenants'),            'cloud_tenant',        {:feature => 'cloud_tenant_show_list'},          '/cloud_tenant/show_list'),
          Menu::Item.new('flavor',              N_('Flavors'),            'flavor',              {:feature => 'flavor_show_list'},                '/flavor/show_list'),
          Menu::Item.new('vm_cloud',            N_('Instances'),          'vm_cloud_explorer',   {:feature => 'vm_cloud_explorer', :any => true}, '/vm_cloud/explorer'),
          Menu::Item.new('orchestration_stack', N_('Stacks'),             'orchestration_stack', {:feature => 'orchestration_stack_show_list'},   '/orchestration_stack/show_list'),
          Menu::Item.new('auth_key_pair_cloud', N_('Key Pairs'),          'auth_key_pair_cloud', {:feature => 'auth_key_pair_cloud_show_list'},   '/auth_key_pair_cloud/show_list'),
          Menu::Item.new('placement_group',     N_('Placement Groups'),   'placement_group',     {:feature => 'placement_group_show_list'},       '/placement_group/show_list'),
          Menu::Item.new('resource_pool_cloud', N_('Cloud Resource Pools'), 'resource_pool_cloud', {:feature => 'resource_pool_cloud_show_list'}, '/resource_pool_cloud/show_list'),
          Menu::Item.new('cloud_databases',     N_('Databases'),          'cloud_database',      {:feature => 'cloud_database'},                  '/cloud_database/show_list'),
        ])
      end

      def infrastructure_menu_section
        Menu::Section.new(:inf, N_("Infrastructure"), nil, [
          Menu::Item.new('ems_infra',         N_('Providers'),         'ems_infra',                  {:feature => 'ems_infra_show_list'},             '/ems_infra/show_list'),
          Menu::Item.new('ems_cluster',       N_("Clusters"),          'ems_cluster',                {:feature => 'ems_cluster_show_list'},           '/ems_cluster/show_list'),
          Menu::Item.new('host',              N_("Hosts"),             'host',                       {:feature => 'host_show_list'},                  '/host/show_list'),
          Menu::Item.new('vm_infra',          N_('Virtual Machines'),  'vm_infra_explorer',          {:feature => 'vm_infra_explorer', :any => true}, '/vm_infra/explorer'),
          Menu::Item.new('resource_pool_infra', N_('Infrastructure Resource Pools'), 'resource_pool_infra', {:feature => 'resource_pool_infra_show_list'}, '/resource_pool_infra/show_list'),
          Menu::Item.new('storage',           N_('Datastores'),        'storage',                    {:feature => 'storage_show_list'},               '/storage/explorer'),
          Menu::Item.new('pxe',               N_('PXE'),               'pxe',                        {:feature => 'pxe', :any => true},               '/pxe/explorer'),
          Menu::Item.new('switch',            N_('Networking'),        'infra_networking',           {:feature => 'infra_networking', :any => true},  '/infra_networking/explorer'),
        ])
      end

      def physical_infrastructure_menu_section
        Menu::Section.new(:phy, N_("Physical Infrastructure"), nil, [
          Menu::Item.new('physical_infra_overview', N_('Overview'),  'physical_infra_overview', {:feature => 'physical_infra_overview'},               '/physical_infra_overview/show'),
          Menu::Item.new('ems_physical_infra',      N_('Providers'), 'ems_physical_infra',      {:feature => 'ems_physical_infra_show_list'},          '/ems_physical_infra/show_list'),
          Menu::Item.new('physical_chassis',        N_('Chassis'),   'physical_chassis',        {:feature => 'physical_chassis_show_list'},            '/physical_chassis/show_list'),
          Menu::Item.new('physical_rack',           N_('Racks'),     'physical_rack',           {:feature => 'physical_rack_show_list'},               '/physical_rack/show_list'),
          Menu::Item.new('physical_server',         N_('Servers'),   'physical_server',         {:feature => 'physical_server_show_list'},             '/physical_server/show_list'),
          Menu::Item.new('physical_storage',        N_('Storages'),  'physical_storage',        {:feature => 'physical_storage_show_list'},            '/physical_storage/show_list'),
          Menu::Item.new('physical_switch',         N_('Switches'),  'physical_switch',         {:feature => 'physical_switch_show_list'},             '/physical_switch/show_list'),
          Menu::Item.new('firmware_registry',       N_('Firmware Registry'), 'firmware',        {:feature => 'firmware', :any => true},                '/firmware_registry/show_list'),
        ])
      end

      def container_menu_section
        Menu::Section.new(:cnt, N_("Containers"), nil, [
          Menu::Item.new('container_dashboard',      N_('Overview'),            'container_dashboard',      {:feature => 'container_dashboard'},                       '/container_dashboard/show'),
          Menu::Item.new('ems_container',            N_('Providers'),           'ems_container',            {:feature => 'ems_container_show_list'},                   '/ems_container/show_list'),
          Menu::Item.new('container_project',        N_('Projects'),            'container_project',        {:feature => 'container_project_show_list'},               '/container_project/show_list'),
          Menu::Item.new('container_route',          N_('Routes'),              'container_route',          {:feature => 'container_route_show_list'},                 '/container_route/show_list'),
          Menu::Item.new('container_service',        N_('Container Services'),  'container_service',        {:feature => 'container_service_show_list'},               '/container_service/show_list'),
          Menu::Item.new('container_replicator',     N_('Replicators'),         'container_replicator',     {:feature => 'container_replicator_show_list'},            '/container_replicator/show_list'),
          Menu::Item.new('container_group',          N_('Pods'),                'container_group',          {:feature => 'container_group_show_list'},                 '/container_group/show_list'),
          Menu::Item.new('container',                N_('Containers'),          'container',                {:feature => 'container_show_list'},                       '/container/show_list'),
          Menu::Item.new('container_node',           N_('Container Nodes'),     'container_node',           {:feature => 'container_node_show_list'},                  '/container_node/show_list'),
          Menu::Item.new('persistent_volume',        N_('Volumes'),             'persistent_volume',        {:feature => 'persistent_volume_show_list', :any => true}, '/persistent_volume/show_list'),
          Menu::Item.new('container_build',          N_('Container Builds'),    'container_build',          {:feature => 'container_build_show_list'},                 '/container_build/show_list'),
          Menu::Item.new('container_image_registry', N_('Image Registries'),    'container_image_registry', {:feature => 'container_image_registry_show_list'},        '/container_image_registry/show_list'),
          Menu::Item.new('container_image',          N_('Container Images'),    'container_image',          {:feature => 'container_image_show_list'},                 '/container_image/show_list'),
          Menu::Item.new('container_template',       N_('Container Templates'), 'container_template',       {:feature => 'container_template_show_list'},              '/container_template/show_list'),
        ])
      end

      def network_menu_section
        Menu::Section.new(:net, N_("Network"), 'carbon--Network_2', [
          Menu::Item.new('ems_network',      N_('Providers'),         'ems_network',      {:feature => 'ems_network_show_list'},     '/ems_network/show_list'),
          Menu::Item.new('cloud_network',    N_('Networks'),          'cloud_network',    {:feature => 'cloud_network_show_list'},   '/cloud_network/show_list'),
          Menu::Item.new('cloud_subnet',     N_('Subnets'),           'cloud_subnet',     {:feature => 'cloud_subnet_show_list'},    '/cloud_subnet/show_list'),
          Menu::Item.new('network_router',   N_('Routers'),           'network_router',   {:feature => 'network_router_show_list'},  '/network_router/show_list'),
          Menu::Item.new('network_service',  N_('Services'),          'network_service',  {:feature => 'network_service_show_list'}, '/network_service/show_list'),
          Menu::Item.new('security_group',   N_('Security Groups'),   'security_group',   {:feature => 'security_group_show_list'},  '/security_group/show_list'),
          Menu::Item.new('security_policy',  N_('Security Policies'), 'security_policy',  {:feature => 'security_policy_show_list'}, '/security_policy/show_list'),
          Menu::Item.new('floating_ip',      N_('Floating IPs'),      'floating_ip',      {:feature => 'floating_ip_show_list'},     '/floating_ip/show_list'),
          Menu::Item.new('network_port',     N_('Ports'),             'network_port',     {:feature => 'network_port_show_list'},    '/network_port/show_list'),
        ])
      end

      def storage_menu_section
        Menu::Section.new(:sto, N_("Storage"), 'carbon--Table', [
          Menu::Item.new('ems_storage',                  N_('Managers'),                'ems_storage',                  {:feature => 'ems_storage_show_list'},                  '/ems_storage/show_list'),
          Menu::Item.new('cloud_volume',                 N_('Volumes'),                 'cloud_volume',                 {:feature => 'cloud_volume_show_list'},                 '/cloud_volume/show_list'),
          Menu::Item.new('cloud_volume_snapshot',        N_('Volume Snapshots'),        'cloud_volume_snapshot',        {:feature => 'cloud_volume_snapshot_show_list'},        '/cloud_volume_snapshot/show_list'),
          Menu::Item.new('cloud_volume_backup',          N_('Volume Backups'),          'cloud_volume_backup',          {:feature => 'cloud_volume_backup_show_list'},          '/cloud_volume_backup/show_list'),
          Menu::Item.new('cloud_volume_type',            N_('Volume Types'),            'cloud_volume_type',            {:feature => 'cloud_volume_type_show_list'},            '/cloud_volume_type/show_list'),
          Menu::Item.new('volume_mapping',               N_('Volume Mappings'),         'volume_mapping',               {:feature => 'volume_mapping_show_list'},               '/volume_mapping/show_list'),
          Menu::Item.new('host_initiator',               N_('Host Initiators'),         'host_initiator',               {:feature => 'host_initiator_show_list'},               '/host_initiator/show_list'),
          Menu::Item.new('host_initiator_group',         N_('Host Initiator Groups'),   'host_initiator_group',         {:feature => 'host_initiator_group_show_list'},         '/host_initiator_group/show_list'),
          Menu::Item.new('physical_storage',             N_('Storages'),                'physical_storage',             {:feature => 'physical_storage_show_list'},             '/physical_storage/show_list'),
          Menu::Item.new('storage_resource',             N_('Storage Resources'),       'storage_resource',             {:feature => 'storage_resource_show_list'},             '/storage_resource/show_list'),
          Menu::Item.new('storage_service',              N_('Storage Services'),        'storage_service',              {:feature => 'storage_service_show_list'},              '/storage_service/show_list'),
          Menu::Item.new('cloud_object_store_container', N_('Object Store Containers'), 'cloud_object_store_container', {:feature => 'cloud_object_store_container_show_list'}, '/cloud_object_store_container/show_list'),
          Menu::Item.new('cloud_object_store_object',    N_('Object Store Objects'),    'cloud_object_store_object',    {:feature => 'cloud_object_store_object_show_list'},    '/cloud_object_store_object/show_list'),
        ])
      end

      def control_menu_section
        Menu::Section.new(:con, N_("Control"), 'carbon--IbmSecurity', [
          Menu::Item.new('miq_policy_set',    N_('Policy Profiles'), 'miq_policy_set',       {:feature => 'miq_policy_set_show_list'},     '/miq_policy_set/show_list'),
          Menu::Item.new('miq_policy',        N_('Policies'),        'miq_policy',           {:feature => 'miq_policy_show_list'},         '/miq_policy/show_list'),
          Menu::Item.new('miq_event',         N_('Events'),          'miq_event',            {:feature => 'miq_event_definition_show_list'},      '/miq_event_definition/show_list'),
          Menu::Item.new('condition',         N_('Conditions'),      'condition',            {:feature => 'condition_show_list'},          '/condition/show_list'),
          Menu::Item.new('miq_action',        N_('Actions'),         'miq_action',           {:feature => 'miq_action_show_list'},         '/miq_action/show_list'),
          Menu::Item.new('miq_alert_set',     N_('Alert Profiles'),  'miq_alert_set',        {:feature => 'miq_alert_set_show_list'},      '/miq_alert_set/show_list'),
          Menu::Item.new('miq_alert',         N_('Alerts'),          'miq_alert',            {:feature => 'miq_alert_show_list'},          '/miq_alert/show_list'),
          Menu::Item.new('miq_policy_rsop',   N_('Simulation'),      'policy_simulation',    {:feature => 'policy_simulation'},            '/miq_policy_rsop'),
          Menu::Item.new('miq_policy_export', N_('Import / Export'), 'policy_import_export', {:feature => 'policy_import_export'},         '/miq_policy_export'),
          Menu::Item.new('miq_policy_logs',   N_('Log'),             'policy_log',           {:feature => 'policy_log'},                   '/miq_policy_log')
        ])
      end

      def automation_menu_section
        Menu::Section.new(:aut, N_("Automation"), 'carbon--FlowData', [
          automation_manager_menu_section,
          configuration_menu_section,
          ansible_menu_section,
          workflow_menu_section,
          automate_menu_section,
        ])
      end

      def automation_manager_menu_section
        Menu::Section.new(:at, N_("Automation"), nil, [
          Menu::Item.new('ems_automation', N_('Providers'), 'ems_automation', {:feature => 'ems_automation_manager_show_list', :any => true}, '/ems_automation/show_list'),
          Menu::Item.new('automation_manager_configured_system', N_('Configured Systems'), 'automation_manager_configured_system', {:feature => 'automation_manager_configured_system_show_list'}, '/automation_manager_configured_system/show_list'),
          Menu::Item.new('configuration_script', N_('Templates'), 'configuration_script', {:feature => 'configuration_script_show_list'}, '/configuration_script/show_list'),
          Menu::Item.new('configuration_job',  N_('Jobs'),     'configuration_job',  {:feature => 'configuration_job_show_list'},      '/configuration_job/show_list')
        ])
      end

      def ansible_menu_section
        Menu::Section.new(:ansible, N_("Embedded Ansible"), nil, [
          Menu::Item.new('ansible_playbooks', N_('Playbooks'), 'embedded_configuration_script_payload', {:feature => 'embedded_configuration_script_payload_view', :any => true}, '/ansible_playbook/show_list'),
          Menu::Item.new('ansible_repositories', N_('Repositories'), 'embedded_configuration_script_source', {:feature => 'embedded_configuration_script_source_view', :any => true}, '/ansible_repository/show_list'),
          Menu::Item.new('ansible_credentials', N_('Credentials'), 'embedded_automation_manager_credentials', {:feature => 'embedded_automation_manager_credentials_view', :any => true}, '/ansible_credential/show_list'),
        ])
      end

      def workflow_menu_section
        if Settings.prototype.ems_workflows.enabled
          Menu::Section.new(:embedded_workflow_automation_manager, N_("Embedded Workflows"), nil, [
            Menu::Item.new('embedded_workflow',            N_('Workflows'),    'embedded_workflow',            {:feature => 'embedded_configuration_script_payload_view', :any => true}, '/workflow/show_list'),
            Menu::Item.new('embedded_workflow_repository', N_('Repositories'), 'embedded_workflow_repository', {:feature => 'embedded_configuration_script_source_view',  :any => true}, '/workflow_repository/show_list'),
            Menu::Item.new('embedded_workflow_credentials', N_('Credentials'), 'embedded_workflow_credentials', {:feature => 'embedded_configuration_script_source_view', :any => true}, '/workflow_credential/show_list')
          ])
        end
      end

      def automate_menu_section
        Menu::Section.new(:automate, N_("Embedded Automate"), nil, [
          Menu::Item.new('miq_ae_class',         N_('Explorer'),        'miq_ae_class_explorer',         {:feature => 'miq_ae_domain_view'},            '/miq_ae_class/explorer'),
          Menu::Item.new('miq_ae_tools',         N_('Simulation'),      'miq_ae_class_simulation',       {:feature => 'miq_ae_class_simulation'},       '/miq_ae_tools/resolve'),
          Menu::Item.new('generic_object_definition', N_('Generic Objects'), 'generic_object_definition', {:feature => 'generic_object_definition'},   '/generic_object_definition/show_list'),
          Menu::Item.new('miq_ae_customization', N_('Customization'),   'miq_ae_customization_explorer', {:feature => 'miq_ae_customization_explorer', :any => true}, '/miq_ae_customization/explorer'),
          Menu::Item.new('miq_ae_export',        N_('Import / Export'), 'miq_ae_class_import_export',    {:feature => 'miq_ae_class_import_export'},    '/miq_ae_tools/import_export'),
          Menu::Item.new('miq_ae_logs',          N_('Log'),             'miq_ae_class_log',              {:feature => 'miq_ae_class_log'},              '/miq_ae_tools/log'),
          Menu::Item.new('miq_request_ae',       N_('Requests'),        'ae_miq_request',                {:feature => 'ae_miq_request_show_list'},      '/miq_request/show_list?typ=ae')
        ])
      end

      def settings_menu_section
        Menu::Section.new(:set, N_("Settings"), 'carbon--Settings', [
          Menu::Item.new('configuration', N_('My Settings'), 'my_settings', {:feature => 'my_settings_view', :any => true}, '/configuration/index'),
          Menu::Item.new('ops_explorer', N_('Application Settings'), 'ops_explorer', {:feature => 'ops_explorer', :any => true}, '/ops/explorer'),
          Menu::Item.new('my_tasks', N_('Tasks'), 'tasks', {:feature => 'tasks', :any => true}, '/miq_task/index?jobs_tab=tasks'),
          help_documentation,
          help_product,
          help_about,
        ])
      end

      def help_documentation
        # note these can still be overriden via Settings.help_menu
        href = if ::Settings.docs.product_documentation_direct_link
                 ::Settings.docs.product_documentation_website
               else
                 '/support/index?support_tab=about'
               end
        help_menu_item(:documentation, :title => N_('Documentation'),
                                       :href  => href)
      end

      def help_product
        help_menu_item(:product, :title => ::Settings.docs.product_support_website_text,
                                 :href  => ::Settings.docs.product_support_website)
      end

      def help_about
        help_menu_item(:about, :title => N_('About'))
      end

      def help_menu_items
        [
          help_documentation,
          help_product,
          help_about,
        ]
      end

      def logout_item
        Menu::Item.new(:logout,
                       N_("Logout"),
                       'logout',
                       nil,
                       '/dashboard/logout',
                       nil,
                       nil,
                       nil,
                       'carbon--Logout')
      end

      private

      def help_menu_item(key, value)
        Menu::Item.new(key,
                       help_menu_field(key, :title, value[:title]),
                       key.to_s,
                       {:feature => key.to_s},
                       help_menu_field(key, :href, value[:href]),
                       help_menu_field(key, :type, value[:type]),
                       nil,
                       value)
      end

      def help_menu_field(key, item, default)
        lambda do
          field = Settings.help_menu.try(key).try(:[], item)
          field.nil? || field.blank? ? default : field
        end
      end
    end
  end
end

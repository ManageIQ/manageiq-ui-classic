# rubocop:disable Metrics/LineLength
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
          configuration_menu_section,
          automation_menu_section,

          control_menu_section,
          monitor_menu_section,

          settings_menu_section,
          help_menu_section,
        ]
      end

      def compute_menu_section
        Menu::Section.new(:compute, N_("Compute"), 'pficon pficon-cpu', [
          clouds_menu_section,
          infrastructure_menu_section,
          physical_infrastructure_menu_section,
          container_menu_section,
        ])
      end

      def configuration_menu_section
        Menu::Section.new(:conf, N_("Configuration"), 'fa fa-cog', [
          Menu::Item.new('ems_configuration',     N_('Providers'),          'ems_configuration',     {:feature => 'ems_configuration_show_list'},     '/ems_configuration/show_list'),
          Menu::Item.new('configuration_profile', N_('Profiles'),           'configuration_profile', {:feature => 'configuration_profile_show_list'}, '/configuration_profile/show_list'),
          Menu::Item.new('configured_system',     N_('Configured Systems'), 'configured_system',     {:feature => 'configured_system_show_list'},     '/configured_system/show_list'),
        ])
      end

      def overview_menu_section
        Menu::Section.new(:vi, N_("Overview"), 'fa fa-dashboard', [
          Menu::Item.new('dashboard',  N_('Dashboard'),  'dashboard',  {:feature => 'dashboard_view'},           '/dashboard/show'),
          Menu::Item.new('report',     N_('Reports'),    'miq_report', {:feature => 'miq_report', :any => true}, '/report/explorer'),
          # Menu::Item.new('usage',    N_('Usage'),      'usage',      {:feature => 'usage'},                    '/report/usage/'), #  / Hiding usage for now - release 5.2
          Settings.product.consumption ? consumption_menu_section : nil,
          Menu::Item.new('miq_capacity_utilization', N_('Utilization'), 'utilization', {:feature => 'utilization'}, '/utilization'),
          chargeback_menu_section,
          Menu::Item.new('optimization', N_('Optimization'), 'optimization', {:feature => 'optimization'}, '/optimization'),
        ])
      end

      def consumption_menu_section
        Menu::Section.new(:cons, N_("Consumption"), nil, [
          Menu::Item.new('consumption', N_('Dashboard'), 'consumption', {:feature => 'consumption', :any => true}, '/consumption/show')
        ])
      end

      def services_menu_section
        Menu::Section.new(:svc, N_("Services"), 'pficon pficon-service', [
          Menu::Item.new('services',       N_('My Services'), 'service',     {:feature => 'service', :any => true},     '/service/explorer'),
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
          Menu::Item.new('cloud_topology',      N_('Topology'),           'cloud_topology',      {:feature => 'cloud_topology'},                  '/cloud_topology/show'),
        ])
      end

      def infrastructure_menu_section
        Menu::Section.new(:inf, N_("Infrastructure"), nil, [
          Menu::Item.new('ems_infra',         N_('Providers'),         'ems_infra',                  {:feature => 'ems_infra_show_list'},             '/ems_infra/show_list'),
          Menu::Item.new('ems_cluster',       N_("Clusters"),          'ems_cluster',                {:feature => 'ems_cluster_show_list'},           '/ems_cluster/show_list'),
          Menu::Item.new('host',              N_("Hosts"),             'host',                       {:feature => 'host_show_list'},                  '/host/show_list'),
          Menu::Item.new('vm_infra',          N_('Virtual Machines'),  'vm_infra_explorer',          {:feature => 'vm_infra_explorer', :any => true}, '/vm_infra/explorer'),
          Menu::Item.new('resource_pool',     N_('Resource Pools'),    'resource_pool',              {:feature => 'resource_pool_show_list'},         '/resource_pool/show_list'),
          Menu::Item.new('storage',           N_('Datastores'),        'storage',                    {:feature => 'storage_show_list'},               '/storage/explorer'),
          Menu::Item.new('pxe',               N_('PXE'),               'pxe',                        {:feature => 'pxe', :any => true},               '/pxe/explorer'),
          Menu::Item.new('firmware_registry', N_('Firmware Registry'), 'firmware_registry',          {:feature => 'firmware_registry', :any => true}, '/firmware_registry/show_list'),
          Menu::Item.new('switch',            N_('Networking'),        'infra_networking',           {:feature => 'infra_networking', :any => true},  '/infra_networking/explorer'),
          Menu::Item.new('infra_topology',    N_('Topology'),          'infra_topology',             {:feature => 'infra_topology', :any => true},    '/infra_topology/show')
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
          Menu::Item.new('physical_infra_topology', N_('Topology'),  'physical_infra_topology', {:feature => 'physical_infra_topology', :any => true}, '/physical_infra_topology/show'),
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
          Menu::Item.new('container_topology',       N_('Topology'),            'container_topology',       {:feature => 'container_topology', :any => true},          '/container_topology/show')
        ])
      end

      def network_menu_section
        Menu::Section.new(:net, N_("Network"), 'pficon pficon-network', [
          Menu::Item.new('ems_network',      N_('Providers'),       'ems_network',      {:feature => 'ems_network_show_list'},    '/ems_network/show_list'),
          Menu::Item.new('cloud_network',    N_('Networks'),        'cloud_network',    {:feature => 'cloud_network_show_list'},  '/cloud_network/show_list'),
          Menu::Item.new('cloud_subnet',     N_('Subnets'),         'cloud_subnet',     {:feature => 'cloud_subnet_show_list'},   '/cloud_subnet/show_list'),
          Menu::Item.new('network_router',   N_('Network Routers'), 'network_router',   {:feature => 'network_router_show_list'}, '/network_router/show_list'),
          Menu::Item.new('security_group',   N_('Security Groups'), 'security_group',   {:feature => 'security_group_show_list'}, '/security_group/show_list'),
          Menu::Item.new('floating_ip',      N_('Floating IPs'),    'floating_ip',      {:feature => 'floating_ip_show_list'},    '/floating_ip/show_list'),
          Menu::Item.new('network_port',     N_('Network Ports'),   'network_port',     {:feature => 'network_port_show_list'},   '/network_port/show_list'),
          Menu::Item.new('network_topology', N_('Topology'),        'network_topology', {:feature => 'network_topology'},         '/network_topology/show'),
        ])
      end

      def storage_menu_section
        Menu::Section.new(:sto, N_("Storage"), 'fa fa-database', [
          block_storage_menu_section,
          object_storage_menu_section,
        ])
      end

      def block_storage_menu_section
        Menu::Section.new(:bst, N_("Block Storage"), nil, [
                            Menu::Item.new('ems_block_storage',
                                           N_('Managers'),
                                           'ems_block_storage',
                                           {:feature => 'ems_block_storage_show_list'},
                                           '/ems_block_storage/show_list'),
                            Menu::Item.new('cloud_volume',
                                           N_('Volumes'),
                                           'cloud_volume',
                                           {:feature => 'cloud_volume_show_list'},
                                           '/cloud_volume/show_list'),
                            Menu::Item.new('cloud_volume_snapshot',
                                           N_('Volume Snapshots'),
                                           'cloud_volume_snapshot',
                                           {:feature => 'cloud_volume_snapshot_show_list'},
                                           '/cloud_volume_snapshot/show_list'),
                            Menu::Item.new('cloud_volume_backup',
                                           N_('Volume Backups'),
                                           'cloud_volume_backup',
                                           {:feature => 'cloud_volume_backup_show_list'},
                                           '/cloud_volume_backup/show_list'),
                            Menu::Item.new('cloud_volume_type',
                                           N_('Volume Types'),
                                           'cloud_volume_type',
                                           {:feature => 'cloud_volume_type_show_list'},
                                           '/cloud_volume_type/show_list'),
                          ])
      end

      def object_storage_menu_section
        Menu::Section.new(:ost, N_("Object Storage"), nil, [
                            Menu::Item.new('ems_object_storage',
                                           N_('Managers'),
                                           'ems_object_storage',
                                           {:feature => 'ems_object_storage_show_list'},
                                           '/ems_object_storage/show_list'),
                            Menu::Item.new('cloud_object_store_container',
                                           N_('Object Store Containers'),
                                           'cloud_object_store_container',
                                           {:feature => 'cloud_object_store_container_show_list'},
                                           '/cloud_object_store_container/show_list'),
                            Menu::Item.new('cloud_object_store_object',
                                           N_('Object Store Objects'),
                                           'cloud_object_store_object',
                                           {:feature => 'cloud_object_store_object_show_list'},
                                           '/cloud_object_store_object/show_list'),
                          ])
      end

      def control_menu_section
        Menu::Section.new(:con, N_("Control"), 'fa fa-shield', [
          Menu::Item.new('miq_policy',        N_('Explorer'),        'control_explorer',     {:feature => 'control_explorer_view'}, '/miq_policy/explorer'),
          Menu::Item.new('miq_policy_rsop',   N_('Simulation'),      'policy_simulation',    {:feature => 'policy_simulation'},     '/miq_policy/rsop'),
          Menu::Item.new('miq_policy_export', N_('Import / Export'), 'policy_import_export', {:feature => 'policy_import_export'},  '/miq_policy/export'),
          Menu::Item.new('miq_policy_logs',   N_('Log'),             'policy_log',           {:feature => 'policy_log'},            "/miq_policy/log")
        ])
      end

      def automation_menu_section
        Menu::Section.new(:aut, N_("Automation"), 'pficon pficon-automation', [
          ansible_menu_section,
          automation_manager_menu_section,
          automate_menu_section,
        ])
      end

      def automation_manager_menu_section
        Menu::Section.new(:at, N_("Ansible Tower"), nil, [
          Menu::Item.new('automation_manager', N_('Explorer'), 'automation_manager', {:feature => 'automation_manager', :any => true}, '/automation_manager/explorer'),
          Menu::Item.new('configuration_job',  N_('Jobs'),     'configuration_job',  {:feature => 'configuration_job_show_list'},      '/configuration_job/show_list')
        ])
      end

      def ansible_menu_section
        Menu::Section.new(:ansible, N_("Ansible"), nil, [
          Menu::Item.new('ansible_playbooks', N_('Playbooks'), 'embedded_configuration_script_payload', {:feature => 'embedded_configuration_script_payload', :any => true}, '/ansible_playbook/show_list'),
          Menu::Item.new('ansible_repositories', N_('Repositories'), 'embedded_configuration_script_source', {:feature => 'embedded_configuration_script_source', :any => true}, '/ansible_repository/show_list'),
          Menu::Item.new('ansible_credentials', N_('Credentials'), 'embedded_automation_manager_credentials', {:feature => 'embedded_automation_manager_credentials', :any => true}, '/ansible_credential/show_list'),
        ])
      end

      def automate_menu_section
        Menu::Section.new(:automate, N_("Automate"), nil, [
          Menu::Item.new('miq_ae_class',         N_('Explorer'),        'miq_ae_class_explorer',         {:feature => 'miq_ae_domain_view'},            '/miq_ae_class/explorer'),
          Menu::Item.new('miq_ae_tools',         N_('Simulation'),      'miq_ae_class_simulation',       {:feature => 'miq_ae_class_simulation'},       '/miq_ae_tools/resolve'),
          Menu::Item.new('generic_object_definition', N_('Generic Objects'), 'generic_object_definition', {:feature => 'generic_object_definition'},   '/generic_object_definition/show_list'),
          Menu::Item.new('miq_ae_customization', N_('Customization'),   'miq_ae_customization_explorer', {:feature => 'miq_ae_customization_explorer', :any => true}, '/miq_ae_customization/explorer'),
          Menu::Item.new('miq_ae_export',        N_('Import / Export'), 'miq_ae_class_import_export',    {:feature => 'miq_ae_class_import_export'},    '/miq_ae_tools/import_export'),
          Menu::Item.new('miq_ae_logs',          N_('Log'),             'miq_ae_class_log',              {:feature => 'miq_ae_class_log'},              '/miq_ae_tools/log'),
          Menu::Item.new('miq_request_ae',       N_('Requests'),        'ae_miq_request',                {:feature => 'ae_miq_request_show_list'},      '/miq_request/show_list?typ=ae')
        ])
      end

      def alerts_menu_section
        Menu::Section.new(:monitor_alerts, N_("Alerts"), nil, [
                            Menu::Item.new('monitor_alerts_overview', N_('Overview'), 'monitor_alerts_overview', {:feature => 'monitor_alerts_overview', :any => true}, '/alerts_overview/show'),
                            Menu::Item.new('monitor_alerts_list', N_('All Alerts'), 'monitor_alerts_list', {:feature => 'monitor_alerts_list', :any => true}, '/alerts_list/show'),
                          ])
      end

      def monitor_menu_section
        Menu::Section.new(:monitor, N_("Monitor"), 'fa fa-heartbeat', [
          alerts_menu_section,
        ])
      end

      def settings_menu_section
        Menu::Section.new(:set, N_("User Settings"), 'pficon pficon-settings', [
          Menu::Item.new('configuration', N_('My Settings'),   'my_settings',  {:feature => 'my_settings', :any => true},  '/configuration/index'),
          Menu::Item.new('my_tasks',      N_('Tasks'),         'tasks',        {:feature => 'tasks', :any => true},        '/miq_task/index?jobs_tab=tasks')
        ], :top_right)
      end

      def help_documentation
        help_menu_item(:documentation, :title => N_('Documentation'),
                                       :href  => '/support/index?support_tab=about')
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

      def help_menu_section
        Menu::Section.new(:help, N_('Help'), 'pficon pficon-help', help_menu_items, :help)
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

# rubocop:disable Metrics/LineLength
module Menu
  class DefaultMenu
    class << self
      def compute_menu_section
        Menu::Section.new(:compute, N_("Compute"), 'pficon pficon-cpu', [
          clouds_menu_section,
          infrastructure_menu_section,
          ::Settings.product.physical_infrastructure ? physical_infrastructure_menu_section : nil,
          container_menu_section
        ].compact)
      end

      def configuration_menu_section
        Menu::Section.new(:conf, N_("Configuration"), 'fa fa-cog', [
          Menu::Item.new('provider_foreman',  N_('Management'), 'provider_foreman_explorer', {:feature => 'provider_foreman_explorer', :any => true}, '/provider_foreman/explorer'),
        ])
      end

      def cloud_inteligence_menu_section
        Menu::Section.new(:vi, N_("Cloud Intel"), 'fa fa-dashboard', [
          Menu::Item.new('dashboard',  N_('Dashboard'),  'dashboard',  {:feature => 'dashboard_view'},           '/dashboard/show'),
          Menu::Item.new('report',     N_('Reports'),    'miq_report', {:feature => 'miq_report', :any => true}, '/report/explorer'),
          # Menu::Item.new('usage',    N_('Usage'),      'usage',      {:feature => 'usage'},                    '/report/usage/'), #  / Hiding usage for now - release 5.2
          Settings.product.consumption ? consumption_menu_section : nil,
          Menu::Item.new('chargeback', N_('Chargeback'), 'chargeback', {:feature => 'chargeback', :any => true}, '/chargeback/explorer'),
          Menu::Item.new('timeline',   N_('Timelines'),  'timeline',   {:feature => 'timeline'},                 '/dashboard/timeline/'),
          Menu::Item.new('rss',        N_('RSS'),        'rss',        {:feature => 'rss'},                      '/alert/show_list')
        ].compact)
      end

      def consumption_menu_section
        Menu::Section.new(:cons, N_("Consumption"), 'fa fa-plus', [
          Menu::Item.new('consumption', N_('Dashboard'), 'consumption', {:feature => 'consumption', :any => true}, '/consumption/show')
        ])
      end

      def services_menu_section
        Menu::Section.new(:svc, N_("Services"), 'pficon pficon-service', [
          Menu::Item.new('services',       N_('My Services'), 'service',     {:feature => 'service', :any => true},     '/service/explorer'),
          Menu::Item.new('catalogs',       N_('Catalogs'),    'catalog',     {:feature => 'catalog', :any => true},     '/catalog/explorer'),
          Menu::Item.new('vm_or_template', N_('Workloads'),   'vm_explorer', {:feature => 'vm_explorer', :any => true}, '/vm_or_template/explorer'),
          Menu::Item.new('miq_request_vm', N_('Requests'),    'miq_request', {:feature => 'miq_request_show_list'},     '/miq_request?typ=service')
        ])
      end

      def clouds_menu_section
        Menu::Section.new(:clo, N_("Clouds"), 'fa fa-plus', [
          Menu::Item.new('ems_cloud',           N_('Providers'),          'ems_cloud',           {:feature => 'ems_cloud_show_list'},             '/ems_cloud'),
          Menu::Item.new('availability_zone',   N_('Availability Zones'), 'availability_zone',   {:feature => 'availability_zone_show_list'},     '/availability_zone'),
          Menu::Item.new('host_aggregate',      N_('Host Aggregates'),    'host_aggregate',      {:feature => 'host_aggregate_show_list'},        '/host_aggregate'),
          Menu::Item.new('cloud_tenant',        N_('Tenants'),            'cloud_tenant',        {:feature => 'cloud_tenant_show_list'},          '/cloud_tenant'),
          Menu::Item.new('flavor',              N_('Flavors'),            'flavor',              {:feature => 'flavor_show_list'},                '/flavor'),
          Menu::Item.new('vm_cloud',            N_('Instances'),          'vm_cloud_explorer',   {:feature => 'vm_cloud_explorer', :any => true}, '/vm_cloud/explorer'),
          Menu::Item.new('orchestration_stack', N_('Stacks'),             'orchestration_stack', {:feature => 'orchestration_stack_show_list'},   '/orchestration_stack'),
          Menu::Item.new('auth_key_pair_cloud', N_('Key Pairs'),          'auth_key_pair_cloud', {:feature => 'auth_key_pair_cloud_show_list'},   '/auth_key_pair_cloud'),
          Menu::Item.new('cloud_topology',      N_('Topology'),           'cloud_topology',      {:feature => 'cloud_topology'},                  '/cloud_topology'),
        ])
      end

      def infrastructure_menu_section
        hosts_name    = hybrid_name(Host,       N_("Hosts"),    N_("Nodes"),            N_("Hosts / Nodes"))
        clusters_name = hybrid_name(EmsCluster, N_("Clusters"), N_("Deployment Roles"), N_("Clusters / Deployment Roles"))

        Menu::Section.new(:inf, N_("Infrastructure"), 'fa fa-plus', [
          Menu::Item.new('ems_infra',        N_('Providers'),        'ems_infra',                  {:feature => 'ems_infra_show_list'},             '/ems_infra'),
          Menu::Item.new('ems_cluster',      clusters_name,          'ems_cluster',                {:feature => 'ems_cluster_show_list'},           '/ems_cluster'),
          Menu::Item.new('host',             hosts_name,             'host',                       {:feature => 'host_show_list'},                  '/host'),
          Menu::Item.new('vm_infra',         N_('Virtual Machines'), 'vm_infra_explorer',          {:feature => 'vm_infra_explorer', :any => true}, '/vm_infra/explorer'),
          Menu::Item.new('resource_pool',    N_('Resource Pools'),   'resource_pool',              {:feature => 'resource_pool_show_list'},         '/resource_pool'),
          Menu::Item.new('storage',          N_('Datastores'),       'storage',                    {:feature => 'storage_show_list'},               '/storage/explorer'),
          Menu::Item.new('pxe',              N_('PXE'),              'pxe',                        {:feature => 'pxe', :any => true},               '/pxe/explorer'),
          Menu::Item.new('switch',           N_('Networking'),       'infra_networking',           {:feature => 'infra_networking', :any => true},  '/infra_networking/explorer'),
          Menu::Item.new('miq_request_host', N_('Requests'),         nil,                          {:feature => 'miq_request_show_list'},           '/miq_request?typ=host'),
          Menu::Item.new('infra_topology',   N_('Topology'), 'infra_topology',                     {:feature => 'infra_topology', :any => true},    '/infra_topology')
        ])
      end

      def physical_infrastructure_menu_section
        Menu::Section.new(:phy, N_("Physical Infrastructure"), 'fa fa-plus fa-2x', [
          Menu::Item.new('ems_physical_infra',    N_('Providers'), 'ems_physical_infra',    {:feature => 'ems_physical_infra_show_list'},    '/ems_physical_infra'),
          Menu::Item.new('physical_server', N_('Servers'),   'physical_server', {:feature => 'physical_server_show_list'}, '/physical_server'),
          Menu::Item.new('physical_infra_topology', N_('Topology'), 'physical_infra_topology', {:feature => 'physical_infra_topology', :any => true}, '/physical_infra_topology')
        ])
      end

      def hybrid_name(klass, name1, name2, name3)
        lambda do
          case klass.node_types
          when :non_openstack then name1
          when :openstack     then name2
          else                     name3
          end
        end
      end
      private :hybrid_name

      def container_menu_section
        Menu::Section.new(:cnt, N_("Containers"), 'fa fa-plus', [
          Menu::Item.new('container_dashboard',      N_('Overview'),            'container_dashboard',      {:feature => 'container_dashboard'},                       '/container_dashboard'),
          Menu::Item.new('ems_container',            N_('Providers'),           'ems_container',            {:feature => 'ems_container_show_list'},                   '/ems_container'),
          Menu::Item.new('container_project',        N_('Projects'),            'container_project',        {:feature => 'container_project_show_list'},               '/container_project'),
          Menu::Item.new('container_route',          N_('Routes'),              'container_route',          {:feature => 'container_route_show_list'},                 '/container_route'),
          Menu::Item.new('container_service',        N_('Container Services'),  'container_service',        {:feature => 'container_service_show_list'},               '/container_service'),
          Menu::Item.new('container_replicator',     N_('Replicators'),         'container_replicator',     {:feature => 'container_replicator_show_list'},            '/container_replicator'),
          Menu::Item.new('container_group',          N_('Pods'),                'container_group',          {:feature => 'container_group_show_list'},                 '/container_group'),
          Menu::Item.new('container',                N_('Containers'),          'container',                {:feature => 'container_show_list'},                       '/container'),
          Menu::Item.new('container_node',           N_('Container Nodes'),     'container_node',           {:feature => 'container_node_show_list'},                  '/container_node'),
          Menu::Item.new('persistent_volume',        N_('Volumes'),             'persistent_volume',        {:feature => 'persistent_volume_show_list', :any => true}, '/persistent_volume'),
          Menu::Item.new('container_build',          N_('Container Builds'),    'container_build',          {:feature => 'container_build_show_list'},                 '/container_build'),
          Menu::Item.new('container_image_registry', N_('Image Registries'),    'container_image_registry', {:feature => 'container_image_registry_show_list'},        '/container_image_registry'),
          Menu::Item.new('container_image',          N_('Container Images'),    'container_image',          {:feature => 'container_image_show_list'},                 '/container_image'),
          Menu::Item.new('container_template',       N_('Container Templates'), 'container_template',       {:feature => 'container_template_show_list'},              '/container_template'),
          Menu::Item.new('container_topology',       N_('Topology'),            'container_topology',       {:feature => 'container_topology', :any => true},          '/container_topology')
        ])
      end

      def datawarehouse_menu_section
        if ::Settings.product.datawarehouse_manager
          Menu::Section.new(:dwh, N_("Datawarehouse"), 'pficon pficon-enterprise', [
            Menu::Item.new('ems_datawarehouse', N_('Providers'), 'ems_datawarehouse',
                           {:feature => 'ems_datawarehouse_show_list'}, '/ems_datawarehouse')
            ])
        end
      end

      def middleware_menu_section
        Menu::Section.new(:mdl, N_("Middleware"), 'pficon pficon-middleware', [
          Menu::Item.new('ems_middleware',        N_('Providers'),   'ems_middleware',        {:feature => 'ems_middleware_show_list'},          '/ems_middleware'),
          Menu::Item.new('middleware_domain',     N_('Domains'),     'middleware_domain',     {:feature => 'middleware_domain_show_list'},       '/middleware_domain'),
          Menu::Item.new('middleware_server',     N_('Servers'),     'middleware_server',     {:feature => 'middleware_server_show_list'},       '/middleware_server'),
          Menu::Item.new('middleware_deployment', N_('Deployments'), 'middleware_deployment', {:feature => 'middleware_deployment_show_list'},   '/middleware_deployment'),
          Menu::Item.new('middleware_datasource', N_('Datasources'), 'middleware_datasource', {:feature => 'middleware_datasource_show_list'},   '/middleware_datasource'),
          Menu::Item.new('middleware_messaging',  N_('Messagings'),  'middleware_messaging',  {:feature => 'middleware_messaging_show_list'},    '/middleware_messaging'),
          Menu::Item.new('middleware_topology',   N_('Topology'),    'middleware_topology',   {:feature => 'middleware_topology', :any => true}, '/middleware_topology')

        ])
      end

      def network_menu_section
        Menu::Section.new(:net, N_("Networks"), 'pficon pficon-network', [
          Menu::Item.new('ems_network',      N_('Providers'),       'ems_network',      {:feature => 'ems_network_show_list'},    '/ems_network'),
          Menu::Item.new('cloud_network',    N_('Networks'),        'cloud_network',    {:feature => 'cloud_network_show_list'},  '/cloud_network'),
          Menu::Item.new('cloud_subnet',     N_('Subnets'),         'cloud_subnet',     {:feature => 'cloud_subnet_show_list'},   '/cloud_subnet'),
          Menu::Item.new('network_router',   N_('Network Routers'), 'network_router',   {:feature => 'network_router_show_list'}, '/network_router'),
          Menu::Item.new('security_group',   N_('Security Groups'), 'security_group',   {:feature => 'security_group_show_list'}, '/security_group'),
          Menu::Item.new('floating_ip',      N_('Floating IPs'),    'floating_ip',      {:feature => 'floating_ip_show_list'},    '/floating_ip'),
          Menu::Item.new('network_port',     N_('Network Ports'),   'network_port',     {:feature => 'network_port_show_list'},   '/network_port'),
          Menu::Item.new('load_balancer',    N_('Load Balancers'),  'load_balancer',    {:feature => 'load_balancer_show_list'},  '/load_balancer'),
          Menu::Item.new('network_topology', N_('Topology'),        'network_topology', {:feature => 'network_topology'},         '/network_topology'),
        ])
      end

      def storage_menu_section
        Menu::Section.new(:sto, N_("Storage"), 'fa fa-database', [
                            block_storage_menu_section,
                            object_storage_menu_section,
                          ])
      end

      def block_storage_menu_section
        Menu::Section.new(:bst, N_("Block Storage"), 'fa fa-database', [
                            Menu::Item.new('ems_block_storage',
                                           N_('Managers'),
                                           'ems_block_storage',
                                           {:feature => 'ems_block_storage_show_list'},
                                           '/ems_block_storage'),
                            Menu::Item.new('cloud_volume',
                                           N_('Volumes'),
                                           'cloud_volume',
                                           {:feature => 'cloud_volume_show_list'},
                                           '/cloud_volume'),
                            Menu::Item.new('cloud_volume_snapshot',
                                           N_('Volume Snapshots'),
                                           'cloud_volume_snapshot',
                                           {:feature => 'cloud_volume_snapshot_show_list'},
                                           '/cloud_volume_snapshot'),
                            Menu::Item.new('cloud_volume_backup',
                                           N_('Volume Backups'),
                                           'cloud_volume_backup',
                                           {:feature => 'cloud_volume_backup_show_list'},
                                           '/cloud_volume_backup'),
                          ])
      end

      def object_storage_menu_section
        Menu::Section.new(:ost, N_("Object Storage"), 'fa fa-database', [
                            Menu::Item.new('ems_object_storage',
                                           N_('Managers'),
                                           'ems_object_storage',
                                           {:feature => 'ems_object_storage_show_list'},
                                           '/ems_object_storage'),
                            Menu::Item.new('cloud_object_store_container',
                                           N_('Object Store Containers'),
                                           'cloud_object_store_container',
                                           {:feature => 'cloud_object_store_container_show_list'},
                                           '/cloud_object_store_container'),
                            Menu::Item.new('cloud_object_store_object',
                                           N_('Object Store Objects'),
                                           'cloud_object_store_object',
                                           {:feature => 'cloud_object_store_object_show_list'},
                                           '/cloud_object_store_object'),
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
        Menu::Section.new(:aut, N_("Automation"), 'fa fa-recycle', [
          ansible_menu_section,
          automation_manager_menu_section,
          automate_menu_section
        ])
      end

      def automation_manager_menu_section
        Menu::Section.new(:at, N_("Ansible Tower"), 'fa fa-cog', [
          Menu::Item.new('automation_manager', N_('Explorer'), 'automation_manager', {:feature => 'automation_manager', :any => true}, '/automation_manager/explorer'),
          Menu::Item.new('configuration_job',  N_('Jobs'),     'configuration_job',  {:feature => 'configuration_job_show_list'},      '/configuration_job')
        ])
      end

      def ansible_menu_section
        Menu::Section.new(:ansible, N_("Ansible"), 'fa fa-recycle', [
          Menu::Item.new('ansible_playbooks', N_('Playbooks'), 'embedded_configuration_script_payload', {:feature => 'embedded_configuration_script_payload', :any => true}, '/ansible_playbook'),
          Menu::Item.new('ansible_repositories', N_('Repositories'), 'embedded_configuration_script_source', {:feature => 'embedded_configuration_script_source', :any => true}, '/ansible_repository'),
          Menu::Item.new('ansible_credentials', N_('Credentials'), 'embedded_automation_manager_credentials', {:feature => 'embedded_automation_manager_credentials', :any => true}, '/ansible_credential'),
        ])
      end

      def automate_menu_section
        Menu::Section.new(:automate, N_("Automate"), 'fa fa-recycle', [
          Menu::Item.new('miq_ae_class',         N_('Explorer'),        'miq_ae_class_explorer',         {:feature => 'miq_ae_domain_view'},            '/miq_ae_class/explorer'),
          Menu::Item.new('miq_ae_tools',         N_('Simulation'),      'miq_ae_class_simulation',       {:feature => 'miq_ae_class_simulation'},       '/miq_ae_tools/resolve'),
          Menu::Item.new('miq_ae_customization', N_('Customization'),   'miq_ae_customization_explorer', {:feature => 'miq_ae_customization_explorer'}, '/miq_ae_customization/explorer'),
          Menu::Item.new('generic_object_definitions', N_('Generic Objects'), 'generic_object_definitions', {:feature => 'generic_object_definition'}, '/generic_object_definition'),
          Menu::Item.new('miq_ae_export',        N_('Import / Export'), 'miq_ae_class_import_export',    {:feature => 'miq_ae_class_import_export'},    '/miq_ae_tools/import_export'),
          Menu::Item.new('miq_ae_logs',          N_('Log'),             'miq_ae_class_log',              {:feature => 'miq_ae_class_log'},              '/miq_ae_tools/log'),
          Menu::Item.new('miq_request_ae',       N_('Requests'),        nil,                             {:feature => 'miq_request_show_list'},         "/miq_request?typ=ae")
        ].compact)
      end

      def optimize_menu_section
        Menu::Section.new(:opt, N_("Optimize"), 'fa fa-lightbulb-o', [
          Menu::Item.new('miq_capacity_utilization', N_('Utilization'), 'utilization', {:feature => 'utilization'}, '/utilization'),
          Menu::Item.new('miq_capacity_planning',    N_('Planning'),    'planning',    {:feature => 'planning'},    '/planning'),
          Menu::Item.new('miq_capacity_bottlenecks', N_('Bottlenecks'), 'bottlenecks', {:feature => 'bottlenecks'}, '/bottlenecks')
        ])
      end

      def alerts_menu_section
        Menu::Section.new(:monitor_alerts, N_("Alerts"), 'fa fa-bullhorn-o fa-2x', [
                            Menu::Item.new('monitor_alerts_overview', N_('Overview'), 'monitor_alerts_overview', {:feature => 'monitor_alerts_overview', :any => true}, '/alerts_overview'),
                            Menu::Item.new('monitor_alerts_list', N_('All Alerts'), 'monitor_alerts_list', {:feature => 'monitor_alerts_list', :any => true}, '/alerts_list'),
                            Menu::Item.new('monitor_alerts_most_recent', N_('Most Recent Alerts'), 'monitor_alerts_most_recent', {:feature => 'monitor_alerts_most_recent', :any => true}, '/alerts_most_recent')
                          ])
      end

      def monitor_menu_section
        if ::Settings.prototype.monitoring
          Menu::Section.new(:monitor, N_("Monitor"), 'fa fa-heartbeat fa-2x', [alerts_menu_section])
        end
      end

      def settings_menu_section
        Menu::Section.new(:set, N_("Settings"), 'pficon pficon-settings', [
          Menu::Item.new('configuration', N_('My Settings'),   'my_settings',  {:feature => 'my_settings', :any => true},  '/configuration/index'),
          Menu::Item.new('my_tasks',      N_('Tasks'),         'tasks',        {:feature => 'tasks', :any => true},        '/miq_task/index?jobs_tab=tasks'),
          Menu::Item.new('ops',           N_('Configuration'), 'ops_explorer', {:feature => 'ops_explorer', :any => true}, '/ops/explorer')
        ], :top_right)
      end

      def default_menu
        [cloud_inteligence_menu_section, services_menu_section, compute_menu_section, configuration_menu_section,
         network_menu_section, middleware_menu_section, datawarehouse_menu_section, storage_menu_section,
         control_menu_section, automation_menu_section, optimize_menu_section, monitor_menu_section,
         settings_menu_section].compact
      end
    end
  end
end

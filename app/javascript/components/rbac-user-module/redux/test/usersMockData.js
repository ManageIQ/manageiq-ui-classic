export const usersMock = [{
  href: 'http://localhost:3000/api/users/10000000000001',
  id: '10000000000001',
  name: 'Administrator',
  email: 'jmarc@redhat.com',
  icon: null,
  created_on: '2017-06-01T02:47:54Z',
  updated_on: '2018-08-23T08:43:48Z',
  userid: 'admin',
  settings: {
    quadicons: {
      ems_cloud: true, ems_container: true, ems_network: true, ems_physical_infra: true, ems_storage: true, host: true, miq_template: true, physical_rack: true, physical_server: true, physical_switch: true, service: true, storage: true, vm: true, ems_infra: true, cloud_manager: true, container_manager: true, infra_manager: true, network_manager: true, physical_infra_manager: true, storage_manager: true,
    },
    views: {
      authkeypaircloud: 'list', availabilityzone: 'list', hostaggregate: 'list', catalog: 'list', cm_providers: 'list', cm_configured_systems: 'list', cm_configuration_profiles: 'list', compare: 'expanded', compare_mode: 'details', condition: 'list', container: 'list', containergroup: 'list', containernode: 'list', containerservice: 'list', containerroute: 'list', containerproject: 'list', containerreplicator: 'list', containerimage: 'list', containerimageregistry: 'list', persistentvolume: 'list', containerbuild: 'list', containertemplate: 'list', cloudobjectstorecontainer: 'list', cloudobjectstoreobject: 'list', cloudtenant: 'list', cloudvolume: 'list', cloudvolumebackup: 'list', cloudvolumesnapshot: 'list', drift: 'expanded', drift_mode: 'details', emscluster: 'grid', emscontainer: 'grid', filesystem: 'list', guestdevice: 'list', flavor: 'list', host: 'grid', job: 'list', manageiq_providers_cloudmanager: 'grid', manageiq_providers_cloudmanager_template: 'list', manageiq_providers_cloudmanager_vm: 'grid', manageiq_providers_containermanager: 'grid', manageiq_providers_embeddedansible_automationmanager_playbook: 'list', manageiq_providers_embeddedautomationmanager_authentication: 'list', manageiq_providers_embeddedautomationmanager_configurationscriptsource: 'list', manageiq_providers_inframanager: 'grid', manageiq_providers_inframanager_vm: 'grid', manageiq_providers_inframanager_template: 'list', manageiq_providers_physicalinframanager: 'list', manageiq_providers_storagemanager: 'list', miqaction: 'list', miqaeclass: 'list', miqaeinstance: 'list', miqevent: 'list', miqpolicy: 'list', miqpolicyset: 'list', miqreportresult: 'list', miqrequest: 'list', miqtemplate: 'list', orchestrationstack: 'list', orchestrationtemplate: 'list', servicetemplate: 'list', storagemanager: 'list', miqtask: 'list', ms: 'grid', physicalserver: 'list', policy: 'list', policyset: 'grid', resourcepool: 'grid', service: 'grid', scanhistory: 'list', storage_files: 'list', summary_mode: 'textual', registryitems: 'list', serverbuild: 'list', storage: 'grid', tagging: 'grid', vm: 'grid', vmortemplate: 'grid', vmcompare: 'compressed', manageiq_providers_middlewaremanager: 'grid', middlewaredatasource: 'list', middlewaredeployment: 'list', middlewaredomain: 'list', middlewaremessaging: 'list', middlewareserver: 'list', middlewareservergroup: 'list', treesize: '20',
    },
    perpage: {
      grid: 20, tile: 20, list: 20, reports: 20,
    },
    topology: { containers_max_items: 100, containers_max_objects: 0 },
    display: {
      startpage: '/dashboard/show', reporttheme: 'default', quad_truncate: 'm', theme: 'red', taskbartext: true, hostcompare: 'Compressed', timezone: 'UTC', display_vms: false, bg_color: '#c00', nav_style: 'vertical', locale: 'en',
    },
    default_search: null,
    ui_service: { display: { locale: null } },
  },
  lastlogon: '2018-08-23T08:43:48Z',
  lastlogoff: '2018-04-09T08:00:29Z',
  current_group_id: '10000000000002',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000002',
    description: 'EvmGroup-super_administrator',
    group_type: 'system',
    sequence: 1,
    created_on: '2017-06-01T02:47:54Z',
    updated_on: '2017-06-01T02:47:54Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000001', name: 'EvmRole-super_administrator', read_only: true, created_at: '2017-06-01T02:47:51Z', updated_at: '2017-06-01T02:47:51Z', settings: null,
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000002', id: '10000000000002', description: 'EvmGroup-super_administrator', group_type: 'system', sequence: 1, created_on: '2017-06-01T02:47:54Z', updated_on: '2017-06-01T02:47:54Z', settings: null, tenant_id: '10000000000001',
  }, {
    href: 'http://localhost:3000/api/groups/10000000000003', id: '10000000000003', description: 'EvmGroup-operator', group_type: 'system', sequence: 2, created_on: '2017-06-01T02:47:54Z', updated_on: '2017-06-01T02:47:54Z', settings: null, tenant_id: '10000000000001',
  }, {
    href: 'http://localhost:3000/api/groups/10000000000008', id: '10000000000008', description: 'EvmGroup-support', group_type: 'system', sequence: 7, created_on: '2017-06-01T02:47:54Z', updated_on: '2017-06-01T02:47:54Z', settings: null, tenant_id: '10000000000001',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000092', id: '10000000000092', name: '/managed/prov_max_cpu/5' }, { href: 'http://localhost:3000/api/tags/10000000000190', id: '10000000000190', name: '/managed/application/acl_2_2_51' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000001' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000001' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000001' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000001' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000001' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000001' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000003',
  id: '10000000000003',
  name: 'Ansible Tower ',
  email: 'jmarc@redhat.com',
  icon: null,
  created_on: '2017-06-05T11:32:30Z',
  updated_on: '2017-09-28T21:17:13Z',
  userid: 'ansible',
  settings: {},
  lastlogon: '2017-09-28T21:17:13Z',
  lastlogoff: null,
  current_group_id: '10000000000005',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000005',
    description: 'EvmGroup-administrator',
    group_type: 'system',
    sequence: 4,
    created_on: '2017-06-01T02:47:54Z',
    updated_on: '2017-06-01T02:47:54Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000002', name: 'EvmRole-administrator', read_only: true, created_at: '2017-06-01T02:47:51Z', updated_at: '2017-06-01T02:47:51Z', settings: null,
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000005', id: '10000000000005', description: 'EvmGroup-administrator', group_type: 'system', sequence: 4, created_on: '2017-06-01T02:47:54Z', updated_on: '2017-06-01T02:47:54Z', settings: null, tenant_id: '10000000000001',
  }, {
    href: 'http://localhost:3000/api/groups/10000000000026', id: '10000000000026', description: 'Cloud-Users', group_type: 'user', sequence: 25, created_on: '2017-06-05T10:25:44Z', updated_on: '2017-06-05T10:25:44Z', settings: null, tenant_id: '10000000000001',
  }],
  tags: [],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000003' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000003' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000003' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000003' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000003' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000003' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000008',
  id: '10000000000008',
  name: 'Chris Keller',
  email: 'ckeller@redhat.com',
  icon: null,
  created_on: '2017-07-09T13:34:01Z',
  updated_on: '2017-09-25T19:50:54Z',
  userid: 'ckeller',
  settings: {},
  lastlogon: '2017-09-25T12:47:34Z',
  lastlogoff: '2017-09-25T19:50:54Z',
  current_group_id: '10000000000029',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000029',
    description: 'ckeller',
    group_type: 'user',
    sequence: 28,
    created_on: '2017-07-09T13:32:26Z',
    updated_on: '2017-07-09T13:34:47Z',
    settings: null,
    tenant_id: '10000000000010',
    miq_user_role: {
      id: '10000000000001', name: 'EvmRole-super_administrator', read_only: true, created_at: '2017-06-01T02:47:51Z', updated_at: '2017-06-01T02:47:51Z', settings: null,
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000029', id: '10000000000029', description: 'ckeller', group_type: 'user', sequence: 28, created_on: '2017-07-09T13:32:26Z', updated_on: '2017-07-09T13:34:47Z', settings: null, tenant_id: '10000000000010',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000110', id: '10000000000110', name: '/managed/prov_max_memory/2048' }, { href: 'http://localhost:3000/api/tags/10000000000188', id: '10000000000188', name: '/managed/application/abrt_2_0_8' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000008' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000008' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000008' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000008' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000008' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000008' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000004',
  id: '10000000000004',
  name: 'Cloud Operators',
  email: 'jmarc@redhat.com',
  icon: null,
  created_on: '2017-06-05T11:33:09Z',
  updated_on: '2017-09-30T01:02:07Z',
  userid: 'cloudops',
  settings: { ui_service: { display: { locale: 'en' } } },
  lastlogon: '2017-09-29T18:27:29Z',
  lastlogoff: '2017-09-30T01:02:07Z',
  current_group_id: '10000000000025',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000025',
    description: 'Cloud-Operators',
    group_type: 'user',
    sequence: 24,
    created_on: '2017-06-05T10:23:47Z',
    updated_on: '2017-09-20T19:58:06Z',
    settings: { dashboard_order: [10000000000058, 10000000000060, 10000000000054, 10000000000057, 10000000000059, 10000000000055, 10000000000056, 10000000000053], report_menus: [['Configuration Management', [['Virtual Machines', ['VMs with Free Space > 50% by Department', 'VMs w/Free Space > 75% by Function', 'VMs w/Free Space > 75% by LOB', 'Copy of VM Disk Usage', 'Hardware Information for VMs', 'Vendor and Type', 'Vendor and Guest OS', 'VM Location and Size', 'VM UUIDs', 'VMs with no UUID', 'VMs with Volume Free Space <= 20%', 'VMs with Volume Free Space >= 80%', 'VMs by MAC Address', 'Unregistered VMs', 'Orphaned VMs', 'VMs Snapshot Summary', 'User Accounts - Windows', 'User Accounts - Linux', 'Account Groups - Windows', 'Account Groups - Linux', 'Guest OS Information - any OS', 'Guest OS Information - Windows', 'Guest OS Information - Linux', 'Guest OS Password Information - Windows', 'Guest OS HKLM Registry Information']], ['Hosts', ['Hosts Summary', 'Host Summary with VM info', 'Virtual Infrastructure Platforms', 'Host - ESX Services', 'Host - ESX Service Console Packages', 'Date brought under Management for Last Week', 'Hardware Information', 'Host Summary for VMs', 'Host Patches', 'Host VM Relationships', 'Host Storage Adapters', 'Host Network Information', 'Host vLANs and vSwitches']], ['Providers', ['Providers Summary', 'Providers Hosts Relationships', 'Providers VMs Relationships', 'Monthly Host Count per Provider', 'Monthly VM Count per Provider']], ['Clusters', ['Clusters Summary', 'Cluster Hosts Affinity', 'Cluster VMs Affinity with Power State', 'Cluster Resources']], ['Resource Pools', ['Resource Pools Summary']], ['Storage', ['Datastores Summary', 'Datastore Summary for VMs', 'Datastore Summary for Hosts', 'Datastore LUN Information']], ['VM Folders', ['Folder VMs Relationships']], ['Containers', ['Nodes By Capacity', 'Nodes By CPU Usage', 'Nodes By Memory Usage', 'Recently Discovered Pods', 'Nodes by Number of CPU Cores', 'Pods per Ready Status', 'Projects by Number of Pods', 'Projects By CPU Usage', 'Projects By Memory Usage', '123', 'Number of Images per Node', 'Projects by Number of Containers']]]], ['Migration Readiness', [['Virtual Machines', ['Summary - VMs migration ready', 'Summary - VMs NOT migration ready', 'Detailed - VMs migration ready', 'Detailed - VMs NOT migration ready']]]], ['Operations', [['Virtual Machines', ['Registered VMs by Free Space', 'Registered VMs with Free Space <35%', 'Unregistered VMs Free Space <35%', 'Online VMs (Powered On)', 'VMs not Powered On', 'Offline VMs Never Scanned', 'Offline VMs with Snapshot', 'VMs without VMware tools', 'VMs with old VMware tools', 'VMware Tools Versions']], ['EVM', ['VMs with EVM Snapshots', 'VMs with Consolidate Helper Snapshots', 'EVM Server UserID Usage Report', 'EVM Server User IDs Never Used']], ['Clusters', ['Cluster - DRS migrations']], ['Events', ['VC Snapshot Events by User']]]], ['VM Sprawl', [['Candidates', ['VMs with Volume Free Space >= 75%', 'VMs with disk free space > 5GB', 'VM Uptime - longest running', 'VMs Powered Off registered to a Host', 'VMs pending Retirement', 'VMs that are Retired', 'VMs with invalid allocation of RAM', 'Summary of VM Create and Deletes']]]], ['Relationships', [['Virtual Machines, Folders, Clusters', ['VM Relationships', 'Folder to VMs Relationships', 'Cluster Relationships']]]], ['Events', [['Operations', ['Operations VMs Powered On/Off for Last Week', 'Events for VM prod_webserver', 'Reconfigure Events by Department', 'VC Events initiated by username EVM86']], ['Policy', ['Policy Events for Last Week', 'Policy Events for the Last 7 Days']]]], ['Performance by Asset Type', [['Virtual Machines', ['Host CPU Usage per VM', 'VM Performance - daily over last week', 'VMs with Max Daily Mem > 50%  (past mo.)', 'VMs with Avg Daily Mem < 50% (past mo.)', 'VMs with Avg Daily CPU > 85% (past mo.)', 'VMs with Max Daily CPU > 85% (past mo.)', 'VMs with Avg Daily Mem > 95% (past mo.)', 'All Departments with Performance', 'Top CPU Consumers (weekly)', 'Top Memory Consumers (weekly)', 'Top Storage Consumers', 'VM Resource Utilization', 'Weekly Utilization Overview']], ['Clusters', ['Cluster Memory and CPU Usage (7 days)']], ['Middleware Servers', ['JVM Heap Usage - daily over last week', 'JVM Non Heap Usage - daily over last week', 'JVM Garbage Collection - daily over last week', 'Transactions Pool - every minute over the last hour', 'Transactions Pool - hourly over the last day']], ['Middleware Datasources', ['Datasource Pool - every minute for the last hour', 'Datasource Pool - hourly for the last day']]]], ['Running Processes', [['Virtual Machines', ['Processes for prod VMs sort by CPU Time']]]], ['Trending', [['Clusters', ['Cluster memory trend  6 months', 'Cluster CPU Trends (last week)', 'Cluster I/O Trends (last week)', 'Cluster Memory Trends (last week)']], ['Storage', ['Datastore Capacity Trend over 6 mos.']], ['Hosts', ['Host Peak CPU Used Trend over 6 mos.', 'Host Peak Memory Used Trends for 6 Mos.', 'Host CPU Trends (last week)', 'Host I/O Trends (last week)', 'Host Memory Trends (last week)']]]], ['Tenants', [['Tenant Quotas', ['Usage per user - testing']]]], ['Provisioning', [['Activity Reports', ['Provisioning Activity - by Approver', 'Provisioning Activity - by Datastore', 'Provisioning Activity - by Requester', 'Provisioning Activity - by VM']]]], ['New Folder', []]] },
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000018', name: 'Cloud-Operators', read_only: false, created_at: '2017-06-05T10:03:20Z', updated_at: '2017-06-05T10:03:20Z', settings: null,
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000025', id: '10000000000025', description: 'Cloud-Operators', group_type: 'user', sequence: 24, created_on: '2017-06-05T10:23:47Z', updated_on: '2017-09-20T19:58:06Z', settings: { dashboard_order: [10000000000058, 10000000000060, 10000000000054, 10000000000057, 10000000000059, 10000000000055, 10000000000056, 10000000000053], report_menus: [['Configuration Management', [['Virtual Machines', ['VMs with Free Space > 50% by Department', 'VMs w/Free Space > 75% by Function', 'VMs w/Free Space > 75% by LOB', 'Copy of VM Disk Usage', 'Hardware Information for VMs', 'Vendor and Type', 'Vendor and Guest OS', 'VM Location and Size', 'VM UUIDs', 'VMs with no UUID', 'VMs with Volume Free Space <= 20%', 'VMs with Volume Free Space >= 80%', 'VMs by MAC Address', 'Unregistered VMs', 'Orphaned VMs', 'VMs Snapshot Summary', 'User Accounts - Windows', 'User Accounts - Linux', 'Account Groups - Windows', 'Account Groups - Linux', 'Guest OS Information - any OS', 'Guest OS Information - Windows', 'Guest OS Information - Linux', 'Guest OS Password Information - Windows', 'Guest OS HKLM Registry Information']], ['Hosts', ['Hosts Summary', 'Host Summary with VM info', 'Virtual Infrastructure Platforms', 'Host - ESX Services', 'Host - ESX Service Console Packages', 'Date brought under Management for Last Week', 'Hardware Information', 'Host Summary for VMs', 'Host Patches', 'Host VM Relationships', 'Host Storage Adapters', 'Host Network Information', 'Host vLANs and vSwitches']], ['Providers', ['Providers Summary', 'Providers Hosts Relationships', 'Providers VMs Relationships', 'Monthly Host Count per Provider', 'Monthly VM Count per Provider']], ['Clusters', ['Clusters Summary', 'Cluster Hosts Affinity', 'Cluster VMs Affinity with Power State', 'Cluster Resources']], ['Resource Pools', ['Resource Pools Summary']], ['Storage', ['Datastores Summary', 'Datastore Summary for VMs', 'Datastore Summary for Hosts', 'Datastore LUN Information']], ['VM Folders', ['Folder VMs Relationships']], ['Containers', ['Nodes By Capacity', 'Nodes By CPU Usage', 'Nodes By Memory Usage', 'Recently Discovered Pods', 'Nodes by Number of CPU Cores', 'Pods per Ready Status', 'Projects by Number of Pods', 'Projects By CPU Usage', 'Projects By Memory Usage', '123', 'Number of Images per Node', 'Projects by Number of Containers']]]], ['Migration Readiness', [['Virtual Machines', ['Summary - VMs migration ready', 'Summary - VMs NOT migration ready', 'Detailed - VMs migration ready', 'Detailed - VMs NOT migration ready']]]], ['Operations', [['Virtual Machines', ['Registered VMs by Free Space', 'Registered VMs with Free Space <35%', 'Unregistered VMs Free Space <35%', 'Online VMs (Powered On)', 'VMs not Powered On', 'Offline VMs Never Scanned', 'Offline VMs with Snapshot', 'VMs without VMware tools', 'VMs with old VMware tools', 'VMware Tools Versions']], ['EVM', ['VMs with EVM Snapshots', 'VMs with Consolidate Helper Snapshots', 'EVM Server UserID Usage Report', 'EVM Server User IDs Never Used']], ['Clusters', ['Cluster - DRS migrations']], ['Events', ['VC Snapshot Events by User']]]], ['VM Sprawl', [['Candidates', ['VMs with Volume Free Space >= 75%', 'VMs with disk free space > 5GB', 'VM Uptime - longest running', 'VMs Powered Off registered to a Host', 'VMs pending Retirement', 'VMs that are Retired', 'VMs with invalid allocation of RAM', 'Summary of VM Create and Deletes']]]], ['Relationships', [['Virtual Machines, Folders, Clusters', ['VM Relationships', 'Folder to VMs Relationships', 'Cluster Relationships']]]], ['Events', [['Operations', ['Operations VMs Powered On/Off for Last Week', 'Events for VM prod_webserver', 'Reconfigure Events by Department', 'VC Events initiated by username EVM86']], ['Policy', ['Policy Events for Last Week', 'Policy Events for the Last 7 Days']]]], ['Performance by Asset Type', [['Virtual Machines', ['Host CPU Usage per VM', 'VM Performance - daily over last week', 'VMs with Max Daily Mem > 50%  (past mo.)', 'VMs with Avg Daily Mem < 50% (past mo.)', 'VMs with Avg Daily CPU > 85% (past mo.)', 'VMs with Max Daily CPU > 85% (past mo.)', 'VMs with Avg Daily Mem > 95% (past mo.)', 'All Departments with Performance', 'Top CPU Consumers (weekly)', 'Top Memory Consumers (weekly)', 'Top Storage Consumers', 'VM Resource Utilization', 'Weekly Utilization Overview']], ['Clusters', ['Cluster Memory and CPU Usage (7 days)']], ['Middleware Servers', ['JVM Heap Usage - daily over last week', 'JVM Non Heap Usage - daily over last week', 'JVM Garbage Collection - daily over last week', 'Transactions Pool - every minute over the last hour', 'Transactions Pool - hourly over the last day']], ['Middleware Datasources', ['Datasource Pool - every minute for the last hour', 'Datasource Pool - hourly for the last day']]]], ['Running Processes', [['Virtual Machines', ['Processes for prod VMs sort by CPU Time']]]], ['Trending', [['Clusters', ['Cluster memory trend  6 months', 'Cluster CPU Trends (last week)', 'Cluster I/O Trends (last week)', 'Cluster Memory Trends (last week)']], ['Storage', ['Datastore Capacity Trend over 6 mos.']], ['Hosts', ['Host Peak CPU Used Trend over 6 mos.', 'Host Peak Memory Used Trends for 6 Mos.', 'Host CPU Trends (last week)', 'Host I/O Trends (last week)', 'Host Memory Trends (last week)']]]], ['Tenants', [['Tenant Quotas', ['Usage per user - testing']]]], ['Provisioning', [['Activity Reports', ['Provisioning Activity - by Approver', 'Provisioning Activity - by Datastore', 'Provisioning Activity - by Requester', 'Provisioning Activity - by VM']]]], ['New Folder', []]] }, tenant_id: '10000000000001',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000188', id: '10000000000188', name: '/managed/application/abrt_2_0_8' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000004' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000004' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000004' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000004' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000004' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000004' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000005',
  id: '10000000000005',
  name: 'Cloud User',
  email: 'jmarc@redhat.com',
  icon: null,
  created_on: '2017-06-05T11:33:34Z',
  updated_on: '2017-09-30T01:02:07Z',
  userid: 'clouduser',
  settings: { ui_service: { display: { locale: 'en' } } },
  lastlogon: '2017-09-29T17:16:22Z',
  lastlogoff: '2017-09-30T01:02:07Z',
  current_group_id: '10000000000026',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000026',
    description: 'Cloud-Users',
    group_type: 'user',
    sequence: 25,
    created_on: '2017-06-05T10:25:44Z',
    updated_on: '2017-06-05T10:25:44Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000019', name: 'Cloud-Users', read_only: false, created_at: '2017-06-05T10:07:29Z', updated_at: '2017-06-05T10:07:29Z', settings: { restrictions: { vms: 'user' } },
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000026', id: '10000000000026', description: 'Cloud-Users', group_type: 'user', sequence: 25, created_on: '2017-06-05T10:25:44Z', updated_on: '2017-06-05T10:25:44Z', settings: null, tenant_id: '10000000000001',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000125', id: '10000000000125', name: '/managed/prov_max_retirement_days/180' }, { href: 'http://localhost:3000/api/tags/10000000000188', id: '10000000000188', name: '/managed/application/abrt_2_0_8' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000005' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000005' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000005' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000005' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000005' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000005' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000007',
  id: '10000000000007',
  name: 'Cloud User1',
  email: 'jmarc@redhat.com',
  icon: null,
  created_on: '2017-06-29T22:56:48Z',
  updated_on: '2017-07-18T19:48:42Z',
  userid: 'clouduser1',
  settings: {},
  lastlogon: '2017-07-18T19:48:42Z',
  lastlogoff: null,
  current_group_id: '10000000000026',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000026',
    description: 'Cloud-Users',
    group_type: 'user',
    sequence: 25,
    created_on: '2017-06-05T10:25:44Z',
    updated_on: '2017-06-05T10:25:44Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000019', name: 'Cloud-Users', read_only: false, created_at: '2017-06-05T10:07:29Z', updated_at: '2017-06-05T10:07:29Z', settings: { restrictions: { vms: 'user' } },
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000026', id: '10000000000026', description: 'Cloud-Users', group_type: 'user', sequence: 25, created_on: '2017-06-05T10:25:44Z', updated_on: '2017-06-05T10:25:44Z', settings: null, tenant_id: '10000000000001',
  }, {
    href: 'http://localhost:3000/api/groups/10000000000025', id: '10000000000025', description: 'Cloud-Operators', group_type: 'user', sequence: 24, created_on: '2017-06-05T10:23:47Z', updated_on: '2017-09-20T19:58:06Z', settings: { dashboard_order: [10000000000058, 10000000000060, 10000000000054, 10000000000057, 10000000000059, 10000000000055, 10000000000056, 10000000000053], report_menus: [['Configuration Management', [['Virtual Machines', ['VMs with Free Space > 50% by Department', 'VMs w/Free Space > 75% by Function', 'VMs w/Free Space > 75% by LOB', 'Copy of VM Disk Usage', 'Hardware Information for VMs', 'Vendor and Type', 'Vendor and Guest OS', 'VM Location and Size', 'VM UUIDs', 'VMs with no UUID', 'VMs with Volume Free Space <= 20%', 'VMs with Volume Free Space >= 80%', 'VMs by MAC Address', 'Unregistered VMs', 'Orphaned VMs', 'VMs Snapshot Summary', 'User Accounts - Windows', 'User Accounts - Linux', 'Account Groups - Windows', 'Account Groups - Linux', 'Guest OS Information - any OS', 'Guest OS Information - Windows', 'Guest OS Information - Linux', 'Guest OS Password Information - Windows', 'Guest OS HKLM Registry Information']], ['Hosts', ['Hosts Summary', 'Host Summary with VM info', 'Virtual Infrastructure Platforms', 'Host - ESX Services', 'Host - ESX Service Console Packages', 'Date brought under Management for Last Week', 'Hardware Information', 'Host Summary for VMs', 'Host Patches', 'Host VM Relationships', 'Host Storage Adapters', 'Host Network Information', 'Host vLANs and vSwitches']], ['Providers', ['Providers Summary', 'Providers Hosts Relationships', 'Providers VMs Relationships', 'Monthly Host Count per Provider', 'Monthly VM Count per Provider']], ['Clusters', ['Clusters Summary', 'Cluster Hosts Affinity', 'Cluster VMs Affinity with Power State', 'Cluster Resources']], ['Resource Pools', ['Resource Pools Summary']], ['Storage', ['Datastores Summary', 'Datastore Summary for VMs', 'Datastore Summary for Hosts', 'Datastore LUN Information']], ['VM Folders', ['Folder VMs Relationships']], ['Containers', ['Nodes By Capacity', 'Nodes By CPU Usage', 'Nodes By Memory Usage', 'Recently Discovered Pods', 'Nodes by Number of CPU Cores', 'Pods per Ready Status', 'Projects by Number of Pods', 'Projects By CPU Usage', 'Projects By Memory Usage', '123', 'Number of Images per Node', 'Projects by Number of Containers']]]], ['Migration Readiness', [['Virtual Machines', ['Summary - VMs migration ready', 'Summary - VMs NOT migration ready', 'Detailed - VMs migration ready', 'Detailed - VMs NOT migration ready']]]], ['Operations', [['Virtual Machines', ['Registered VMs by Free Space', 'Registered VMs with Free Space <35%', 'Unregistered VMs Free Space <35%', 'Online VMs (Powered On)', 'VMs not Powered On', 'Offline VMs Never Scanned', 'Offline VMs with Snapshot', 'VMs without VMware tools', 'VMs with old VMware tools', 'VMware Tools Versions']], ['EVM', ['VMs with EVM Snapshots', 'VMs with Consolidate Helper Snapshots', 'EVM Server UserID Usage Report', 'EVM Server User IDs Never Used']], ['Clusters', ['Cluster - DRS migrations']], ['Events', ['VC Snapshot Events by User']]]], ['VM Sprawl', [['Candidates', ['VMs with Volume Free Space >= 75%', 'VMs with disk free space > 5GB', 'VM Uptime - longest running', 'VMs Powered Off registered to a Host', 'VMs pending Retirement', 'VMs that are Retired', 'VMs with invalid allocation of RAM', 'Summary of VM Create and Deletes']]]], ['Relationships', [['Virtual Machines, Folders, Clusters', ['VM Relationships', 'Folder to VMs Relationships', 'Cluster Relationships']]]], ['Events', [['Operations', ['Operations VMs Powered On/Off for Last Week', 'Events for VM prod_webserver', 'Reconfigure Events by Department', 'VC Events initiated by username EVM86']], ['Policy', ['Policy Events for Last Week', 'Policy Events for the Last 7 Days']]]], ['Performance by Asset Type', [['Virtual Machines', ['Host CPU Usage per VM', 'VM Performance - daily over last week', 'VMs with Max Daily Mem > 50%  (past mo.)', 'VMs with Avg Daily Mem < 50% (past mo.)', 'VMs with Avg Daily CPU > 85% (past mo.)', 'VMs with Max Daily CPU > 85% (past mo.)', 'VMs with Avg Daily Mem > 95% (past mo.)', 'All Departments with Performance', 'Top CPU Consumers (weekly)', 'Top Memory Consumers (weekly)', 'Top Storage Consumers', 'VM Resource Utilization', 'Weekly Utilization Overview']], ['Clusters', ['Cluster Memory and CPU Usage (7 days)']], ['Middleware Servers', ['JVM Heap Usage - daily over last week', 'JVM Non Heap Usage - daily over last week', 'JVM Garbage Collection - daily over last week', 'Transactions Pool - every minute over the last hour', 'Transactions Pool - hourly over the last day']], ['Middleware Datasources', ['Datasource Pool - every minute for the last hour', 'Datasource Pool - hourly for the last day']]]], ['Running Processes', [['Virtual Machines', ['Processes for prod VMs sort by CPU Time']]]], ['Trending', [['Clusters', ['Cluster memory trend  6 months', 'Cluster CPU Trends (last week)', 'Cluster I/O Trends (last week)', 'Cluster Memory Trends (last week)']], ['Storage', ['Datastore Capacity Trend over 6 mos.']], ['Hosts', ['Host Peak CPU Used Trend over 6 mos.', 'Host Peak Memory Used Trends for 6 Mos.', 'Host CPU Trends (last week)', 'Host I/O Trends (last week)', 'Host Memory Trends (last week)']]]], ['Tenants', [['Tenant Quotas', ['Usage per user - testing']]]], ['Provisioning', [['Activity Reports', ['Provisioning Activity - by Approver', 'Provisioning Activity - by Datastore', 'Provisioning Activity - by Requester', 'Provisioning Activity - by VM']]]], ['New Folder', []]] }, tenant_id: '10000000000001',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000125', id: '10000000000125', name: '/managed/prov_max_retirement_days/180' }, { href: 'http://localhost:3000/api/tags/10000000000188', id: '10000000000188', name: '/managed/application/abrt_2_0_8' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000007' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000007' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000007' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000007' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000007' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000007' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000002',
  id: '10000000000002',
  name: 'Demo Guy',
  email: null,
  icon: null,
  created_on: '2017-06-04T12:13:27Z',
  updated_on: '2017-06-04T12:13:51Z',
  userid: 'demo',
  settings: {},
  lastlogon: '2017-06-04T12:13:43Z',
  lastlogoff: '2017-06-04T12:13:51Z',
  current_group_id: '10000000000004',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000004',
    description: 'EvmGroup-user',
    group_type: 'system',
    sequence: 3,
    created_on: '2017-06-01T02:47:54Z',
    updated_on: '2017-06-01T02:47:54Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000009', name: 'EvmRole-user', read_only: true, created_at: '2017-06-01T02:47:53Z', updated_at: '2017-06-01T02:47:53Z', settings: null,
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000004', id: '10000000000004', description: 'EvmGroup-user', group_type: 'system', sequence: 3, created_on: '2017-06-01T02:47:54Z', updated_on: '2017-06-01T02:47:54Z', settings: null, tenant_id: '10000000000001',
  }],
  tags: [],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000002' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000002' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000002' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000002' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000002' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000002' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000006',
  id: '10000000000006',
  name: 'fisherprice',
  email: null,
  icon: null,
  created_on: '2017-06-07T15:35:12Z',
  updated_on: '2017-06-07T15:35:12Z',
  userid: 'fisherprice',
  settings: {},
  lastlogon: null,
  lastlogoff: null,
  current_group_id: '10000000000004',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000004',
    description: 'EvmGroup-user',
    group_type: 'system',
    sequence: 3,
    created_on: '2017-06-01T02:47:54Z',
    updated_on: '2017-06-01T02:47:54Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000009', name: 'EvmRole-user', read_only: true, created_at: '2017-06-01T02:47:53Z', updated_at: '2017-06-01T02:47:53Z', settings: null,
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000004', id: '10000000000004', description: 'EvmGroup-user', group_type: 'system', sequence: 3, created_on: '2017-06-01T02:47:54Z', updated_on: '2017-06-01T02:47:54Z', settings: null, tenant_id: '10000000000001',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000109', id: '10000000000109', name: '/managed/prov_max_memory/1024' }, { href: 'http://localhost:3000/api/tags/10000000000125', id: '10000000000125', name: '/managed/prov_max_retirement_days/180' }, { href: 'http://localhost:3000/api/tags/10000000000188', id: '10000000000188', name: '/managed/application/abrt_2_0_8' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000006' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000006' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000006' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000006' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000006' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000006' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000010',
  id: '10000000000010',
  name: 'loic',
  email: 'lavenel@redhat.com',
  icon: null,
  created_on: '2017-09-04T19:51:52Z',
  updated_on: '2017-09-04T19:51:52Z',
  userid: 'loic',
  settings: {},
  lastlogon: null,
  lastlogoff: null,
  current_group_id: '10000000000012',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000012',
    description: 'EvmGroup-user_self_service',
    group_type: 'system',
    sequence: 11,
    created_on: '2017-06-01T02:47:54Z',
    updated_on: '2017-06-01T02:47:54Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000011', name: 'EvmRole-user_self_service', read_only: true, created_at: '2017-06-01T02:47:53Z', updated_at: '2017-06-01T02:47:53Z', settings: { restrictions: { vms: 'user_or_group' } },
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000012', id: '10000000000012', description: 'EvmGroup-user_self_service', group_type: 'system', sequence: 11, created_on: '2017-06-01T02:47:54Z', updated_on: '2017-06-01T02:47:54Z', settings: null, tenant_id: '10000000000001',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000109', id: '10000000000109', name: '/managed/prov_max_memory/1024' }, { href: 'http://localhost:3000/api/tags/10000000000125', id: '10000000000125', name: '/managed/prov_max_retirement_days/180' }, { href: 'http://localhost:3000/api/tags/10000000000188', id: '10000000000188', name: '/managed/application/abrt_2_0_8' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000010' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000010' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000010' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000010' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000010' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000010' }],
}, {
  href: 'http://localhost:3000/api/users/10000000000011',
  id: '10000000000011',
  name: 'Loic Avenel',
  email: 'email@loic.com',
  icon: null,
  created_on: '2017-09-21T20:26:42Z',
  updated_on: '2017-09-21T20:26:42Z',
  userid: 'loic2',
  settings: {},
  lastlogon: null,
  lastlogoff: null,
  current_group_id: '10000000000034',
  first_name: null,
  last_name: null,
  current_group: {
    id: '10000000000034',
    description: 'loic Group',
    group_type: 'user',
    sequence: 32,
    created_on: '2017-09-21T20:26:06Z',
    updated_on: '2017-09-21T20:26:06Z',
    settings: null,
    tenant_id: '10000000000001',
    miq_user_role: {
      id: '10000000000021', name: 'Loic Role', read_only: false, created_at: '2017-09-21T20:25:11Z', updated_at: '2017-09-21T20:25:11Z', settings: { restrictions: { vms: 'user' } },
    },
  },
  miq_groups: [{
    href: 'http://localhost:3000/api/groups/10000000000034', id: '10000000000034', description: 'loic Group', group_type: 'user', sequence: 32, created_on: '2017-09-21T20:26:06Z', updated_on: '2017-09-21T20:26:06Z', settings: null, tenant_id: '10000000000001',
  }],
  tags: [{ href: 'http://localhost:3000/api/tags/10000000000109', id: '10000000000109', name: '/managed/prov_max_memory/1024' }, { href: 'http://localhost:3000/api/tags/10000000000125', id: '10000000000125', name: '/managed/prov_max_retirement_days/180' }, { href: 'http://localhost:3000/api/tags/10000000000188', id: '10000000000188', name: '/managed/application/abrt_2_0_8' }],
  actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/users/10000000000011' }, { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/users/10000000000011' }, { name: 'edit', method: 'put', href: 'http://localhost:3000/api/users/10000000000011' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/users/10000000000011' }, { name: 'set_current_group', method: 'post', href: 'http://localhost:3000/api/users/10000000000011' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/users/10000000000011' }],
}];

export const categoriesMock = [{
  href: 'http://localhost:3000/api/categories/10000000000001', id: '10000000000001', description: 'Location', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'The geographic location of the resource, such as New York, Chicago, or London.', tag_id: '10000000000003', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'location', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000001' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000001' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000001' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000006', id: '10000000000006', description: 'Workload', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'The workloads a resource provides, such as Web Server, Database, or Firewall.', tag_id: '10000000000008', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'function', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000006' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000006' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000006' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000016', id: '10000000000016', description: 'Owner', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'The individual or group that owns the resource.', tag_id: '10000000000018', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'owner', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000016' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000016' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000016' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000020', id: '10000000000020', description: 'Environment', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'The resource environment, such as Development, QA, Test, or Production', tag_id: '10000000000022', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'environment', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000020' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000020' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000020' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000026', id: '10000000000026', description: 'User roles', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: null, tag_id: '10000000000028', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'role', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000026' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000026' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000026' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000034', id: '10000000000034', description: 'Service Level', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'The level of service associated with this resource.', tag_id: '10000000000036', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'service_level', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000034' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000034' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000034' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000038', id: '10000000000038', description: 'Customer', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'The name of the customer associated with this resource.', tag_id: '10000000000040', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'customer', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000038' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000038' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000038' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000039', id: '10000000000039', description: 'Line of Business', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'The Line of Business the resource is assigned to, such as Retail, Trading, or Manufacturing.', tag_id: '10000000000041', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'lob', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000039' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000039' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000039' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000040', id: '10000000000040', description: 'Department', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'The department the resource is assigned to, such as HR, Accounting, or Sales.', tag_id: '10000000000042', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'department', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000040' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000040' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000040' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000057', id: '10000000000057', description: 'Cost Center', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Cost Center', tag_id: '10000000000059', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'cc', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000057' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000057' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000057' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000060', id: '10000000000060', description: 'Network Location', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'The network location the resource is to be used, such as DMZ, Internal network or Cloud', tag_id: '10000000000062', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'network_location', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000060' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000060' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000060' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000064', id: '10000000000064', description: 'Exclusions', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'Operations that the resource may be excluded from, such as Analysis or Cloning.', tag_id: '10000000000066', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'exclusions', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000064' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000064' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000064' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000067', id: '10000000000067', description: 'Provisioning Scope', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'Provisioning Scope', tag_id: '10000000000069', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'prov_scope', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000067' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000067' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000067' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000070', id: '10000000000070', description: 'EVM Operations', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Operations', tag_id: '10000000000072', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'operations', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000070' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000070' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000070' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000074', id: '10000000000074', description: 'Quota - Max CPUs', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Maximum number of CPUs allowed by Quota', tag_id: '10000000000076', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'quota_max_cpu', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000074' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000074' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000074' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000085', id: '10000000000085', description: 'Auto Approve - Max CPU', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Maximum number of CPUs allowed by Auto Approval', tag_id: '10000000000087', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'prov_max_cpu', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000085' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000085' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000085' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000091', id: '10000000000091', description: 'Auto Approve - Max VM', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Maximum number of VMs allowed by Auto Approval', tag_id: '10000000000093', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'prov_max_vm', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000091' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000091' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000091' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000097', id: '10000000000097', description: 'Quota - Max  Memory', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Maximum Memory allowed by Quota (GB)', tag_id: '10000000000099', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'quota_max_memory', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000097' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000097' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000097' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000106', id: '10000000000106', description: 'Auto Approve - Max Memory', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Maximum Memory allowed by Auto Approval (GB)', tag_id: '10000000000108', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'prov_max_memory', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000106' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000106' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000106' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000111', id: '10000000000111', description: 'Quota - Max  Storage', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Maximum Storage allowed by Quota (GB)', tag_id: '10000000000113', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'quota_max_storage', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000111' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000111' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000111' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000119', id: '10000000000119', description: 'Auto Approve - Max Retirement Days', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Maximum Days for Retirement allowed by Auto Approval', tag_id: '10000000000121', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'prov_max_retirement_days', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000119' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000119' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000119' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000124', id: '10000000000124', description: 'LifeCycle', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'LifeCycle Options', tag_id: '10000000000126', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'lifecycle', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000124' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000124' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000124' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000126', id: '10000000000126', description: 'Parent Folder Path (VMs & Templates)', icon: null, read_only: true, syntax: 'string', single_value: true, example_text: null, tag_id: '10000000000130', parent_id: '0', show: true, default: null, perf_by_tag: null, name: 'folder_path_blue', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000126' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000126' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000126' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000128', id: '10000000000128', description: 'Parent Folder Path (Hosts & Clusters)', icon: null, read_only: true, syntax: 'string', single_value: true, example_text: null, tag_id: '10000000000132', parent_id: '0', show: true, default: null, perf_by_tag: null, name: 'folder_path_yellow', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000128' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000128' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000128' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000129', id: '10000000000129', description: 'Parent Folder Path (Hosts & Clusters)', icon: null, read_only: true, syntax: 'string', single_value: true, example_text: null, tag_id: '10000000000133', parent_id: '0', show: true, default: null, perf_by_tag: null, name: 'folder_path_yellow', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000129' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000129' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000129' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000140', id: '10000000000140', description: 'Application', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Application', tag_id: '10000000000145', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'application', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000140' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000140' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000140' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000141', id: '10000000000141', description: 'AWS Reservation Status', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'AWS Reservation Status', tag_id: '10000000000146', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'aws_reservation_statud', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000141' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000141' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000141' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000142', id: '10000000000142', description: 'csra', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'csra', tag_id: '10000000000147', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'csra', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000142' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000142' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000142' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000143', id: '10000000000143', description: 'flavor', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'flavor', tag_id: '10000000000148', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'flavor', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000143' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000143' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000143' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000144', id: '10000000000144', description: 'flex_maximum', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'flex_maximum', tag_id: '10000000000149', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'flex_maximum', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000144' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000144' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000144' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000145', id: '10000000000145', description: 'flex_monitor', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'flex_monitor', tag_id: '10000000000150', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'flex_monitor', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000145' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000145' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000145' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000146', id: '10000000000146', description: 'project', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'project', tag_id: '10000000000151', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'project', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000146' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000146' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000146' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000147', id: '10000000000147', description: 'Turbonomic', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'Turbonomic', tag_id: '10000000000152', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'turbonomic', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000147' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000147' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000147' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000148', id: '10000000000148', description: 'service_template_filter', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'service_template_filter', tag_id: '10000000000153', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'service_template_filter', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000148' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000148' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000148' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000149', id: '10000000000149', description: 'Service Catalog', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'Service Catalog', tag_id: '10000000000154', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'service_catalog', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000149' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000149' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000149' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000174', id: '10000000000174', description: 'Approval Required', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Approval Required', tag_id: '10000000000183', parent_id: '0', show: true, default: null, perf_by_tag: false, name: 'approval_required', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000174' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000174' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000174' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000182', id: '10000000000182', description: 'Migration Group', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Group of VMs prepared for migration.', tag_id: '10000000000207', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'migration_group', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000182' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000182' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000182' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000186', id: '10000000000186', description: 'Network Mapping', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Mapping between source network(s) and a destination network for migration.', tag_id: '10000000000211', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'network_mapping', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000186' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000186' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000186' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000188', id: '10000000000188', description: 'Storage Mapping', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Mapping between source storage(s) and a destination storage for migration.', tag_id: '10000000000213', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'storage_mapping', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000188' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000188' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000188' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000192', id: '10000000000192', description: 'V2V - Transformation Host', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'Transformation Host role enabled for V2V.', tag_id: '10000000000217', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'v2v_transformation_host', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000192' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000192' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000192' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000195', id: '10000000000195', description: 'V2V - Transformation Method', icon: null, read_only: false, syntax: 'string', single_value: false, example_text: 'Transformation methods supported for V2V.', tag_id: '10000000000220', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'v2v_transformation_method', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000195' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000195' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000195' }],
}, {
  href: 'http://localhost:3000/api/categories/10000000000198', id: '10000000000198', description: 'Transformation Status', icon: null, read_only: false, syntax: 'string', single_value: true, example_text: 'VM has been migrated.', tag_id: '10000000000223', parent_id: '0', show: true, default: true, perf_by_tag: null, name: 'transformation_status', actions: [{ name: 'edit', method: 'post', href: 'http://localhost:3000/api/categories/10000000000198' }, { name: 'delete', method: 'post', href: 'http://localhost:3000/api/categories/10000000000198' }, { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/categories/10000000000198' }],
}];

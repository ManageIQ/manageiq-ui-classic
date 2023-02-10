export const scheduleResponse1 = {
  action_type: 'vm',
  schedule_description: 'Schedule Description 1',
  schedule_name: 'Schedule Name 1',
  filter_type: 'all',
  enabled: true,
  schedule_start_date: '02/10/2023',
  schedule_start_hour: 12,
  schedule_start_min: 50,
  schedule_time_zone: 'Arizona',
  schedule_timer_type: 'Daily',
  schedule_timer_value: 5,
};

const instanceNames = ['Automation',
  'Event',
  'GenericObject',
  'MiqEvent',
  'parse_automation_request',
  'parse_event_stream',
  'parse_provider_category',
  'Request'];

const targetClasses = [['Availability Zone', 'AvailabilityZone'],
  ['Cloud Network', 'CloudNetwork'],
  ['Cloud Object Store Container', 'CloudObjectStoreContainer'],
  ['Cloud Subnet', 'CloudSubnet'],
  ['Cloud Tenant', 'CloudTenant'],
  ['Cloud Volume', 'CloudVolume']];

export const targets = [['asia-east1-a', '11'],
  ['asia-east1-b', '10'],
  ['asia-east1-c', '12'],
  ['asia-east2-a', '71'],
  ['asia-east2-b', '72'],
  ['asia-east2-c', '73'],
  ['asia-northeast1-a', '15']];

export const scheduleResponse2 = {
  action_type: 'automation_request',
  filter_type: null,
  filter_value: null,
  filtered_item_list: null,
  instance_name: 'GenericObject',
  instance_names: instanceNames,
  object_message: 'TEtsvd',
  object_request: 'AutomationRequest',
  schedule_description: 'sfjdfgnkdjfngkdfngldk',
  schedule_enabled: '1',
  schedule_name: 'ccccccc',
  schedule_start_date: '02/10/2023',
  schedule_start_hour: 12,
  schedule_start_min: 50,
  schedule_time_zone: 'Arizona',
  schedule_timer_type: 'Daily',
  schedule_timer_value: 5,
  starting_object: 'SYSTEM/PROCESS',
  target_class: 'AvailabilityZone',
  target_id: '20',
  target_classes: targetClasses,
  targets,
  zone_id: '5',
};

export const actionResponse = {
  instance_names: instanceNames,
  target_classes: targetClasses,
};

export const timezones = [
  { name: 'International Date Line West', description: '(GMT-12:00) International Date Line West' },
  { name: 'American Samoa', description: '(GMT-11:00) American Samoa' },
  { name: 'Midway Island', description: '(GMT-11:00) Midway Island' },
  { name: 'Hawaii', description: '(GMT-10:00) Hawaii' },
  { name: 'Alaska', description: '(GMT-09:00) Alaska' },
];

export const actionOptions = [
  ['VM Analysis', 'vm'],
  ['Template Analysis', 'miq_template'],
  ['Host Analysis', 'host'],
  ['Container Image Analysis', 'container_image'],
  ['Automation Tasks', 'automation_request'],
];

const vmOptions = [
  ['All VMs', 'all'],
  ['All VMs for Providers', 'ems'],
  ['All VMs for Clusters', 'cluster'],
  ['All VMs for Host', 'host'],
  ['A single VM', 'vm']];

const hostOptions = [
  ['All Hosts', 'all'],
  ['All Hosts for Providers', 'ems'],
  ['All Hosts for Clusters', 'cluster'],
  ['All Hosts for Host', 'host'],
  ['A single Host', 'host']];

export const filterOptions = [
  { keys: ['vm'], option: vmOptions },
  { keys: ['miq_template'], option: hostOptions }];

export const resources = [
  { id: '13', description: 'AAA' },
  { id: '3', description: 'Amazon Zone' },
  { id: '2', description: 'Azure Zone' },
  { id: '4', description: 'Config Zone' },
  { id: '1', description: 'Default Zone' },
  { id: '5', description: 'Google Zone' },
];

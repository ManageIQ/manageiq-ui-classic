// Types to be exported
export type ServerId = string | undefined;
export type ServerName = string | undefined;
export type UrlType = string;

export interface IServerItem {
  href: UrlType;
  id: ServerId;
  name: ServerName;
}

export interface IServers {
  name: string;
  count: number;
  subcount: number;
  resources: IServerItem[];
}

export interface IMiqServerCapabilities {
  vixDisk: boolean; // true,
  concurrent_miqproxies: number; // 0
}

export interface IMiqServer {
  href: UrlType; // http://localhost:3000/api/miq_server/10r18 ,
  id: ServerId; // 10r18 ,
  guid: string; // 5d23f5e2-f88e-11e6-a62e-c85b76c00e1e ,
  status: string; // started ,
  started_on: string; // 2017-06-01T21:11:02Z ,
  pid: number; // 30703,
  build: string; // 20170601141102_61eee1a ,
  name: string; // EVM ,
  capabilities: IMiqServerCapabilities;
  last_heartbeat: string; // 2017-06-01T21:11:02Z ,
  is_master: string; // false,
  version: string; // master ,
  zone_id: string; // 10r1 ,
  vm_id: string; // 10r1855 ,
  sql_spid: string; // 30711
}

export interface IMiqServerAction {
  name: string; // add_lifecycle_event
  method: string; // post,
  href: string; // http://localhost:3000/api/vms/10r1855,
}

export interface IServerData {
  href: UrlType;
  id: ServerId;
  vendor: string; // openstack ,
  name: string; // dave.lab.example.com ,
  location: string; // unknown ,
  host_id: string; // 10r22 ,
  created_on: string; // 2017-01-19T20:30:05Z ,
  updated_on: string; // 2017-03-15T14:56:01Z ,
  guid: string; // 0f9e6c02-de86-11e6-8f25-0050569ff54a ,
  ems_id: string; // 10r43 ,
  uid_ems: string; // 3c628865-00ab-4615-bb63-e90162c379e2 ,
  power_state: string; // on ,
  state_changed_on: string; // 2017-01-19T20:30:05Z ,
  connection_state: string; // connected ,
  template: string; // false,
  miq_group_id: string; // 10r1 ,
  type: string; // ManageIQ::Providers::Openstack::CloudManager::Vm ,
  ems_ref: string; // 3c628865-00ab-4615-bb63-e90162c379e2 ,
  ems_cluster_id: string; // 10r18 ,
  flavor_id: string; // 10r940 ,
  availability_zone_id: string; // 10r49 ,
  cloud: string; // true,
  cloud_tenant_id: string; // 10r19 ,
  raw_power_state: string; // ACTIVE ,
  tenant_id: string; // 10r1 ,
  miq_server: IMiqServer;
  actions: IMiqServerAction[];
}

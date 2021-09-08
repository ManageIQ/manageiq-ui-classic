import { componentTypes, validatorTypes } from '@@ddf';

export const portTypes = [
  { label: __('ISCSI'), value: 'ISCSI' },
  { label: __('FC'), value: 'FC' },
  { label: __('NVMe'), value: 'NVMeFC' },
];

const loadProviders = () =>
  API.get(
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_volume_mapping=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

const loadStorages = id => API.get(`/api/providers/${id}?attributes=type,physical_storages`)
  // eslint-disable-next-line camelcase
  .then(({ physical_storages }) => physical_storages.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

const loadCloudVolumes = storage_id => API.get(`/api/cloud_volumes/?expand=resources&attributes=id,name&filter[]=physical_storage.id=${storage_id}`)
  .then(({ resources }) => resources.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

const loadHostInitiators = storage_id => API.get(`/api/host_initiators/?expand=resources&attributes=id,name&filter[]=physical_storage.id=${storage_id}`)
  .then(({ resources }) => resources.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

const createSchema = (emsId, setEmsId, storageId, setStorageId, volumeId, setVolumeId,
                      hostInitiatorId, setHostInitiatorId) => ({

  fields: [
    {
      component: componentTypes.SELECT,
      name: 'ems_id',
      key: 'ems_id',
      id: 'ems_id',
      label: __('Provider:'),
      isRequired: true,
      includeEmpty: true,
      loadOptions: loadProviders,
      onChange: value => setEmsId(value),
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.SELECT,
      name: 'physical_storage_id',
      id: 'physical_storage_id',
      label: __('Physical Storage:'),
      isRequired: true,
      includeEmpty: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      loadOptions: () => (emsId ? loadStorages(emsId) : Promise.resolve([])),
      onChange: new_storage_id => setStorageId(new_storage_id),
      key: emsId,
      condition: {
        when: 'ems_id',
        isNotEmpty: true,
      },
    },
    {
      component: componentTypes.SELECT,
      name: 'cloud_volume_id',
      id: 'cloud_volume_id',
      label: __('Volume:'),
      isRequired: true,
      includeEmpty: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      loadOptions: () => (storageId ? loadCloudVolumes(storageId) : Promise.resolve([])),
      onChange: cloud_volume_id => setVolumeId(cloud_volume_id),
      key: storageId,
      condition: {
        when: 'physical_storage_id',
        isNotEmpty: true,
      },
    },
    {
      component: componentTypes.SELECT,
      name: 'host_initiator_id',
      id: 'host_initiator_id',
      label: __('Host Initiator:'),
      isRequired: true,
      includeEmpty: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      loadOptions: () => (storageId ? loadHostInitiators(storageId) : Promise.resolve([])),
      onChange: host_initiator_id => setHostInitiatorId(host_initiator_id),
      key: storageId,
      condition: {
        when: 'physical_storage_id',
        isNotEmpty: true,
      },
    },
  ],
});

export default createSchema;

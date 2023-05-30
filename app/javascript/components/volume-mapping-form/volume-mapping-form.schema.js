/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@@ddf';

export const portTypes = [
  { label: __('ISCSI'), value: 'ISCSI' },
  { label: __('FC'), value: 'FC' },
  { label: __('NVMe'), value: 'NVMeFC' },
];

const loadProviders = () =>
  API.get(
    // eslint-disable-next-line max-len
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_volume_mapping=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

const loadStorages = (id) => API.get(`/api/providers/${id}?attributes=type,physical_storages`)
  .then(({ physical_storages }) => physical_storages.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

const loadCloudVolumes = (storage_id) => API.get(`/api/cloud_volumes/?expand=resources&attributes=id,name&filter[]=physical_storage.id=${storage_id}`)
  .then(({ resources }) => resources.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

const loadHostInitiators = (storage_id, volume_id) =>
  API.get(`/api/host_initiators/?expand=resources&attributes=id,name,cloud_volumes&filter[]=physical_storage.id=${storage_id}`)
    .then(({ resources }) => {
      const hostsUnmappedToVolume = resources.filter((host) => {
        const volumeIds = host.cloud_volumes.map(({ id }) => id);
        return !volumeIds.includes(volume_id);
      });

      const options = hostsUnmappedToVolume.map(({ name, id }) => ({
        label: name,
        value: id,
      }));

      if (options.length === 0) {
        options.unshift({ label: sprintf(__('No Host Initiator found')), value: '-1' });
      } else {
        options.unshift({ label: `<${__('Choose')}>`, value: '-1' });
      }

      return options;
    });

const loadHostInitiatorGroups = (storage_id, volume_id) =>
  // eslint-disable-next-line max-len
  API.get(`/api/host_initiator_groups/?expand=resources&attributes=id,name,host_initiators,cloud_volumes&filter[]=physical_storage.id=${storage_id}`)
    .then(({ resources }) => {
      const nonEmptyGroups = resources.filter((group) => group.host_initiators.length > 0);

      const groupsUnmappedToVolume = nonEmptyGroups.filter((group) => {
        const volumeIds = group.cloud_volumes.map(({ id }) => id);
        return !volumeIds.includes(volume_id);
      });

      const options = groupsUnmappedToVolume.map(({ name, id }) => ({
        label: name,
        value: id,
      }));

      if (options.length === 0) {
        options.unshift({ label: sprintf(__('No Host Initiator Group found')), value: '-1' });
      } else {
        options.unshift({ label: `<${__('Choose')}>`, value: '-1' });
      }

      return options;
    });

const createSchema = (state, setState, ems, initialValues, storageId, setStorageId, volumeId, setVolumeId) => {
  let emsId = state.ems_id;
  if (initialValues && initialValues.ems_id) {
    emsId = initialValues.ems_id;
  }
  return ({
    fields: [
      {
        component: componentTypes.SELECT,
        name: 'ems_id',
        id: 'ems_id',
        key: `${emsId}`,
        label: __('Provider:'),
        placeholder: __('<Choose>'),
        isRequired: true,
        isDisabled: ems,
        includeEmpty: true,
        loadOptions: loadProviders,
        onChange: (value) => setState({ ...state, ems_id: value }),
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.SELECT,
        name: 'physical_storage_id',
        id: 'physical_storage_id',
        label: __('Physical Storage:'),
        isRequired: true,
        placeholder: __('<Choose>'),
        includeEmpty: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        loadOptions: () => (emsId ? loadStorages(emsId) : Promise.resolve([])),
        onChange: (new_storage_id) => setStorageId(new_storage_id),
        key: `physical_storage_id-${emsId}`,
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
        onChange: (cloud_volume_id) => setVolumeId(cloud_volume_id),
        key: `cloud_volume_id-${storageId}`,
        condition: {
          and: [
            { when: 'physical_storage_id', isNotEmpty: true },
            { when: 'ems_id', isNotEmpty: true },
          ],
        },
      },
      {
        component: 'enhanced-select',
        name: 'host_initiator_id',
        id: 'host_initiator_id',
        label: __('Host Initiator:'),
        isRequired: true,
        validate: [
          { type: validatorTypes.REQUIRED },
          { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: __('Required') },
        ],
        onInputChange: () => null,
        resolveProps: (_props, _field, { getState }) => {
          const stateValues = getState().values;
          const volume = stateValues.cloud_volume_id;

          return {
            key: JSON.stringify(volume),
            loadOptions: async() => loadHostInitiators(storageId, volume),
          };
        },
        condition: {
          and: [
            { when: 'ems_id', isNotEmpty: true },
            { when: 'physical_storage_id', isNotEmpty: true },
            { when: 'cloud_volume_id', isNotEmpty: true },
            { when: 'mapping_object', is: 'host' },
          ],
        },
      },
      {
        component: componentTypes.SELECT,
        name: 'host_initiator_group_id',
        id: 'host_initiator_group_id',
        label: __('Host Initiator Group:'),
        isRequired: true,
        helperText: __('This list does not include host initiator groups which have no host initiators or which are '
          + 'already mapped to the selected volume.'),
        validate: [
          { type: validatorTypes.REQUIRED },
          { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: __('Required') },
        ],
        onInputChange: () => null,
        resolveProps: (_props, _field, { getState }) => {
          const stateValues = getState().values;
          const volume = stateValues.cloud_volume_id;

          return {
            key: JSON.stringify(volume),
            loadOptions: async() => loadHostInitiatorGroups(storageId, volume),
          };
        },
        condition: {
          and: [
            { when: 'ems_id', isNotEmpty: true },
            { when: 'physical_storage_id', isNotEmpty: true },
            { when: 'cloud_volume_id', isNotEmpty: true },
            { when: 'mapping_object', is: 'host_group' },
          ],
        },
      },
      {
        component: 'radio',
        label: 'Map directly to Host Initiator, or to a Group?',
        name: 'mapping_object',
        initialValue: 'host',
        condition: {
          and: [
            { when: 'physical_storage_id', isNotEmpty: true },
            { when: 'ems_id', isNotEmpty: true },
          ],
        },
        options: [
          {
            label: 'Host Initiator',
            value: 'host',
          },
          {
            label: 'Host Initiator Group',
            value: 'host_group',
          },
        ],
      },

    ],
  });
};

export default createSchema;

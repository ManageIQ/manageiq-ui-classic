import Api from '../http_api/api';

// in providers capabilities jsonb field, capabilities are saved like {'abstract_capability': 'name', 'uuid': '999..', 'value': 'true/false'},
// but in the storage_manager models the capability name is saved under different keys, instead of 'abstract_capability'.
// the parameter fieldName enables to dynamically access the correct key.

const loadCapabilities = (sourceType, sourceId, fieldName) => Api.get(`/api/${sourceType}/${sourceId}?attributes=capabilities`)
  .then(({ capabilities }) => capabilities.map((capability) => (
    { value: capability.uuid, label: `${capability[`${fieldName}`]}: ${capability.value}` })));

export default loadCapabilities;

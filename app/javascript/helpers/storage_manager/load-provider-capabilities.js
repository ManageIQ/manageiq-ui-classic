// in providers capabilities jsonb field, capabilities are saved like {'abstract_capability': 'name', 'uuid': '999..', 'value': 'true/false'},
// but in the storage_manager models the capability name is saved under different keys, instead of 'abstract_capability'.
// the parameter fieldName enables to dynamically access the correct key.

const loadProviderCapabilities = (providerId) => API.get(`/api/providers/${providerId}?attributes=capabilities`)
  .then(({ capabilities }) => {
    const options = [];
    Object.keys(capabilities).forEach((key) => {
      capabilities[key].forEach((capability) =>
        options.push({ value: capability.uuid, label: `${key}: ${capability.value}` }));
    });
    return options;
  });

export default loadProviderCapabilities;

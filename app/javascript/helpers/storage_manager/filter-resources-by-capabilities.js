import { arrayIncludes, getCapabilityUuid } from './filter-by-capabilities-utils';

const filterResourcesByCapabilities = async(filterArray, providerCapabilities) =>
  API.get(`/api/storage_resources?expand=resources&attributes=id,name,capabilities`)
    .then(({ resources }) => {
      const valueArray = [];
      resources.forEach((resource) => {
        const resourceCapsUuids = [];
        Object.keys(resource.capabilities).forEach((capabilityName) => {
          resource.capabilities[capabilityName].forEach((capabilityValue) => {
            resourceCapsUuids.push(getCapabilityUuid(providerCapabilities, capabilityName, capabilityValue));
          });
        });
        resourceCapsUuids.push('-1'); // to filter-in the N/A option of capabilities

        if (arrayIncludes(resourceCapsUuids, filterArray)) {
          valueArray.push(resource);
        }
      });
      const options = valueArray.map(({ name, id }) => ({ label: name, value: id }));
      if (options.length === 0) {
        options.unshift({ label: sprintf(__('No storage resource with selected capabilities.')), value: '-1' });
      }
      return options;
    });

export default filterResourcesByCapabilities;

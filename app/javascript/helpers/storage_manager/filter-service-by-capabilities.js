import { arrayIncludes, getCapabilityUuid } from './filter-by-capabilities-utils';

const filterServicesByCapabilities = async(filterArray, providerCapabilities) =>
  API.get(`/api/storage_services?expand=resources&attributes=id,name,capabilities`)
    .then(({ resources }) => {
      const valueArray = [];
      resources.forEach((resource) => {
        const capsToFilter = [];
        Object.keys(resource.capabilities).forEach((key) => {
          capsToFilter.push(getCapabilityUuid(providerCapabilities, key, resource.capabilities[key]));
        });
        capsToFilter.push('-1'); // to filter-in the N/A option of capabilities

        if (arrayIncludes(capsToFilter, filterArray)) {
          valueArray.push(resource);
        }
      });

      const options = valueArray.map(({ name, id }) => ({ label: name, value: id }));

      if (options.length === 0) {
        options.unshift({ label: sprintf(__('No storage service with selected capabilities.')), value: '-1' });
      }

      options.unshift({ label: `<${__('Choose')}>`, value: '-2' });

      return options;
    });

export default filterServicesByCapabilities;

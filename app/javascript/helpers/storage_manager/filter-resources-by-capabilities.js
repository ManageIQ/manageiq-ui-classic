import {
  arrayIncludes,
  getCapabilityUuid,
} from './filter-by-capabilities-utils';

const filterResourcesByCapabilities = async(
  filterArray,
  providerCapabilities,
  emsRefList = []
) => {
  const filterByEmsRef = !!emsRefList?.length;

  return API.get(
    `/api/storage_resources?expand=resources&attributes=id,name,${filterByEmsRef ? 'ems_ref,' : ''}capabilities`
  ).then(({ resources }) => {
    const valueArray = [];
    resources.forEach((resource) => {
      if (filterByEmsRef && !emsRefList?.includes(resource?.ems_ref)) {
        return null;
      }

      const resourceCapsUuids = [];
      Object.keys(resource.capabilities).forEach((capabilityName) => {
        resource.capabilities[capabilityName].forEach((capabilityValue) => {
          resourceCapsUuids.push(
            getCapabilityUuid(
              providerCapabilities,
              capabilityName,
              capabilityValue
            )
          );
        });
      });
      resourceCapsUuids.push('-1'); // to filter-in the N/A option of capabilities

      if (arrayIncludes(resourceCapsUuids, filterArray)) {
        valueArray.push(resource);
      }
      return valueArray;
    });
    const options = valueArray.map(({ name, id }) => ({
      label: name,
      value: id,
    }));
    if (options.length === 0) {
      options.unshift({
        label: sprintf(__('No storage resource with selected capabilities.')),
        value: '-1',
      });
    }
    return options;
  });
};

export default filterResourcesByCapabilities;

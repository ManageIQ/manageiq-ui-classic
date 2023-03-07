/** function that use to filter the services/resources by capabilities. */
const arrayIncludes = (including, included) => included.every((includedItem) => including.includes(includedItem));

const getCapabilityUuid = (providerCapabilities, capabilityName, capabilityValue) => {
  const capVals = providerCapabilities[capabilityName];
  return capVals.find((capVal) => capVal.value === capabilityValue).uuid;
};

const getProviderCapabilities = async(providerId) => API.get(`/api/providers/${providerId}?attributes=capabilities`)
  .then((result) => result.capabilities);

export { arrayIncludes, getCapabilityUuid, getProviderCapabilities };

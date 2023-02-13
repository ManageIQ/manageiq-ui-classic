/** function that use to filter the services/resources by capabilities. */
const arrayIncludes = (including, included) => including.length >= included.length
  && included.every((includedItem) => including.includes(includedItem));

const getCapabilityUuid = (providerCapabilities, capabilityName, capabilityValue) => {
  const capVals = providerCapabilities[capabilityName];
  return capVals.find((capVal) => capVal.value === capabilityValue).uuid;
};

export { arrayIncludes, getCapabilityUuid };

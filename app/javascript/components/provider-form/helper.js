/** Field names that needs to be trimmed. */
const trimFields = ['hostname'];

const isObject = (data) => (typeof data === 'object' && data !== null);

/** Function to trim a field's value.
 * If the nested data object contains the key which includes in variable 'trimFields',
 * then, trim the spaces from the value before sending to API.
 */
export const trimFieldValue = (resource) => {
  if (!isObject(resource)) {
    return resource;
  }

  if (Array.isArray(resource)) {
    resource.forEach((value, index) => {
      resource[index] = trimFieldValue(value);
    });
    return resource;
  }

  const keys = Object.keys(resource);

  keys.find((key) => {
    const value = resource[key];

    if (trimFields.includes(key)) {
      resource[key] = resource[key] ? resource[key].trim() : '';
      return true;
    } if (typeof value === 'object' && value !== null) {
      return trimFieldValue(value) !== undefined;
    }

    return false;
  });

  return { ...resource };
};

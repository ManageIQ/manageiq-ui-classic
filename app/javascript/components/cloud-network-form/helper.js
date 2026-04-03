import handleFailure from '../../helpers/handle-failure';

const networkProviders = (options = {}) => {
  const newOptions = {
    attributes: ['id', 'name', 'type'],
    handleFailure,
    ...options,
  };

  const baseUrl = '/api/providers?expand=resources&attributes=id,name,supports_cloud_network_create&filter[]=supports_cloud_network_create=true';
  const url = `${baseUrl}&attributes=${newOptions.attributes.map(encodeURIComponent).join(',')}`;

  return API.get(url)
    .then((response) => response.resources || [])
    .catch(newOptions.handleFailure);
};

export {
  networkProviders,
};

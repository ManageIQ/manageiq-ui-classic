import handleFailure from '../../helpers/handle-failure';

const networkProviders = (options = {}) => {
  const newOptions = {
    attributes: ['id', 'name', 'type'],
    handleFailure,
    ...options,
  };

  const baseUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_floating_ip&filter[]=supports_create_floating_ip=true';
  const url = `${baseUrl}&attributes=${newOptions.attributes.map(encodeURIComponent).join(',')}`;

  return API.get(url)
    .then((response) => response.resources || [])
    .catch(newOptions.handleFailure);
};

export {
  networkProviders,
};

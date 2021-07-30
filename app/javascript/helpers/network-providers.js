import handleFailure from './handle-failure';
import { API } from '../http_api';

export const networkProviders = (options = {}) => {
  const newOptions = {
    attributes: ['id', 'name', 'type'],
    handleFailure,
    ...options,
  };
  const baseUrl = '/api/providers?collection_class=ManageIQ::Providers::NetworkManager&expand=resources&filter[]=supports_cloud_subnet_create=true';
  const url = `${baseUrl}&attributes=${newOptions.attributes.map(encodeURIComponent).join(',')}`;

  return API.get(url)
    .then(response => response.resources || [])
    .catch(newOptions.handleFailure);
};

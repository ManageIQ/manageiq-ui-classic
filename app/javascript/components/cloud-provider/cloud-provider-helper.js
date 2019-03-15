import { API } from '../../http_api';

const loadProviderServerZones = () =>
  API.get('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name')
    .then(({ resources }) => ({ serverZones: resources.map(({ name, id }) => ({ value: id, label: name })) }));

const loadProviderTypes = () =>
  API.options('/api/providers')
    .then(({ data: { supported_providers } }) => supported_providers // eslint-disable-line camelcase
      .filter(({ kind }) => kind === 'cloud')
      .map(({ title, type }) => ({ value: type, label: title })))
    .then(types => ({ emsTypes: types }));

const loadOpenStackInfraProviders = () =>
  API.get('/api/providers?expand=resources&filter[]=type=ManageIQ::Providers::Openstack::InfraManager&attributes=name,provider_id&sort_by=name')
    .then(({ resources }) => resources.map(({ name, provider_id }) => ({ value: provider_id, label: name }))) // eslint-disable-line camelcase
    .then(openstackInfraProviders => ({ openstackInfraProviders: [{ label: `<${__('blank')}>` }, ...openstackInfraProviders] }));

export const loadFormData = () => Promise.all([loadProviderServerZones(), loadProviderTypes(), loadOpenStackInfraProviders()])
  .then(responses => responses.reduce((acc, curr) => ({
    ...acc,
    ...curr,
  }), {}));

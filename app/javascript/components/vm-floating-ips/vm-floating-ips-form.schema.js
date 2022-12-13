/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@@ddf';

const loadFloatingIps = (recordId) =>
  API.get(`/api/vms/${recordId}`).then(({ cloud_tenant_id }) =>
    API.get(`/api/floating_ips?expand=resources&filter[]=cloud_tenant_id=${cloud_tenant_id}`).then(
      ({ resources }) => {
        const temp = resources.map(({ id, address }) => ({
          label: address,
          value: id,
        }));
        return temp;
      }
    ));

const createSchema = (recordId) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'floating_ip',
      name: 'floating_ip',
      label: __('Floating IP'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
      includeEmpty: true,
      loadOptions: () => (recordId ? loadFloatingIps(recordId) : Promise.resolve([])),
    },
  ],
});

export default createSchema;

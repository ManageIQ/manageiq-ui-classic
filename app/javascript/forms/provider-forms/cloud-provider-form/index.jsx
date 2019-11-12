import React, { useEffect, useState } from 'react';
import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

import { API } from '../../../http_api';
import MiqFormRenderer from '../../data-driven-form';

const loadProviderServerZones = () =>
  API.get('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name')
    .then(({ resources }) => resources.map(({ name, id }) => ({ value: id, label: name })));

const initialSchema = emsTypes => ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: __('Name'),
    options: emsTypes,
  }, {
    component: componentTypes.SELECT,
    name: 'type',
    label: __('Type'),
    placeholder: `<${__('Choose')}>`,
    options: emsTypes,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.SELECT,
    name: 'zone',
    label: __('Zone'),
    placeholder: `<${__('Choose')}>`,
    loadOptions: loadProviderServerZones,
    initialValue: '1',
  }],
});

const loadProviderTypes = () =>
  API.options('/api/providers')
    .then(({ data: { supported_providers } }) => supported_providers // eslint-disable-line camelcase
      .filter(({ kind }) => kind === 'cloud')
      .map(({ title, type }) => ({ value: type, label: title })))
    .then(types => ({ emsTypes: types }));

const loadProviderTabs = type => API.options(`/api/providers?type=${type}`).then(({ data }) => ({
  providerType: type,
  field: {
    component: componentTypes.SUB_FORM,
    condition: {
      when: 'type',
      is: type,
    },
    ...data.provider_form_schema,
  },
}));

const CloudProviderForm = (props) => {
  const [schema, setSchema] = useState({ fields: [] });
  useEffect(() => {
    loadProviderTypes().then(({ emsTypes }) => {
      Promise.all(emsTypes
        .filter(({ value }) => value !== 'ManageIQ::Providers::Openstack::CloudManager')
        .map(({ value }) => loadProviderTabs(value)))
        .then((schemas) => {
          const fields = schemas.map(({ field }) => field);
          setSchema({
            fields: [
              ...initialSchema(emsTypes).fields,
              ...fields,
            ],
          });
        });
    });
  }, []);
  console.log(props);
  return (
    <div>
      There will be dragons
      <MiqFormRenderer
        schema={schema}
        onSubmit={console.log}
      />
    </div>
  );
};

export default CloudProviderForm;

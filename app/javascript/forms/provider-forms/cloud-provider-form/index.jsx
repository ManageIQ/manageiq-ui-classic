import React, { useEffect, useState } from 'react';
import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

import { API } from '../../../http_api';
import MiqFormRenderer from '../../data-driven-form';

const loadProviderServerZones = () =>
  API.get('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name')
    .then(({ resources }) => resources.map(({ name }) => ({ value: name, label: name })));

const initialSchema = emsTypes => ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: __('Name'),
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.SELECT,
    name: 'type',
    label: __('Type'),
    placeholder: `<${__('Choose')}>`,
    options: emsTypes,
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.SELECT,
    name: 'zone_name',
    label: __('Zone'),
    placeholder: `<${__('Choose')}>`,
    loadOptions: loadProviderServerZones,
    initialValue: 'default',
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
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
    name: type,
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

  const onSubmit = (data) => {
    // Omit validator results from each endpoint
    const endpoints = Object.keys(data.endpoints).reduce((obj, key) => {
      const { valid, ...endpoint } = data.endpoints[key]; // eslint-disable-line no-unused-vars
      return { ...obj, [key]: endpoint };
    }, {});

    API.post('/api/providers', { ...data, endpoints, ddf: true });
  };
  return (
    <div>
      There will be dragons
      <MiqFormRenderer
        schema={schema}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default CloudProviderForm;

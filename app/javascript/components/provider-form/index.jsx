import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { componentTypes, validatorTypes } from '@@ddf';
import { pick, keyBy } from 'lodash';

import { API } from '../../http_api';
import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import EditingContext from './editing-context';
import ProtocolSelector from './protocol-selector';
import ProviderCredentials from './provider-credentials';
import ValidateProviderCredentials from './validate-provider-credentials';
import DetectButton from './detect-button';
import validateName from '../../helpers/storage_manager/validate-names';
import { trimFieldValue } from './helper';

const findSkipSubmits = (schema, items) => {
  const found = schema.skipSubmit && items.includes(schema.name) ? [schema.name] : [];
  const children = Array.isArray(schema.fields) ? schema.fields.flatMap((field) => findSkipSubmits(field, items)) : [];
  return [...found, ...children];
};

const ProviderForm = ({
  providerId, kind, title, redirect,
}) => {
  const edit = !!providerId;
  const [{ fields, initialValues }, setState] = useState({});

  const submitLabel = edit ? __('Save') : __('Add');

  const commonFields = [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        async(value) => validateName('providers', value, edit),
      ],
    },
    {
      component: componentTypes.SELECT,
      id: 'zone_id',
      name: 'zone_id',
      label: __('Zone'),
      includeEmpty: true,
      loadOptions: () =>
        API.get('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name')
          .then(({ resources }) => resources.map(({ id: value, name: label }) => ({ value, label }))),
      isRequired: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    },
  ];

  const loadProviderFields = (type) => API.options(`/api/providers?type=${type}`).then(
    ({ data: { provider_form_schema } }) => ([ // eslint-disable-line camelcase
      ...commonFields,
      {
        component: componentTypes.SUB_FORM,
        id: type,
        name: type,
        ...provider_form_schema, // eslint-disable-line camelcase
      },
    ]),
  );

  const typeSelectField = (edit, filter, setState, providers) => ({
    component: componentTypes.SELECT,
    id: 'type',
    name: 'type',
    label: __('Type'),
    kind: filter,
    isDisabled: edit,
    isRequired: true,
    options: providers,
    onChange: (value) => {
      if (value !== '-1') {
        loadProviderFields(value).then((fields) => setState(({ fields: [firstField] }) => ({
          fields: [firstField, ...fields],
        })));
      } else {
        setState(({ fields: [firstField] }) => ({
          fields: [firstField,
            {
              id: 'networkWarning',
              component: componentTypes.PLAIN_TEXT,
              name: 'networkWarning',
              label: __('Please select a type.'),
            }],
        }));
      }
    },
  });

  useEffect(() => {
    API.options('/api/providers').then(({ data: { supported_providers } }) => { // eslint-disable-line camelcase
      const filter = kind;
      const providers = supported_providers.filter(({ kind }) => kind === filter).map(({ title, type }) => ({ value: type, label: title }));
      providers.unshift({ label: `<${__('Choose')}>`, value: '-1' });

      if (providerId) {
        miqSparkleOn();
        API.get(`/api/providers/${providerId}?attributes=endpoints,authentications`).then(({
          type,
          endpoints: _endpoints,
          authentications: _authentications,
          ...provider
        }) => {
        // DDF can handle arrays with FieldArray, but only with a heterogenous schema, which isn't enough.
        // As a solution, we're converting the arrays to objects indexed by role/authtype and converting
        // it back to an array of objects before submitting the form. Validation, however, should not be
        // converted back as the schema is being used in the password sanitization process.
          const endpoints = keyBy(_endpoints, 'role');
          const authentications = keyBy(_authentications, 'authtype');
          loadProviderFields(type).then((fields) => {
            setState({
              fields: [typeSelectField(true, kind, setState, providers), ...fields],
              initialValues: {
                ...provider,
                type,
                endpoints,
                authentications,
              },
            });
          }).then(miqSparkleOff);
        });
      } else {
      // As the typeSelectField relies on the setState() function, it's necessary to set the initial state
      // here and not above in the useState() function.
        setState({ fields: [typeSelectField(false, kind, setState, providers)] });
      }
    });
  }, [providerId]);

  const onCancel = () => {
    const message = sprintf(
      providerId
        ? __('Edit of %s "%s" was cancelled by the user')
        : __('Add of %s was cancelled by the user'),
      title,
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'success', redirect);
  };

  const onSubmit = ({ type, ..._data }, { getState }) => {
    if (type !== '-1') {
      miqSparkleOn();

      const message = sprintf(__('%s %s was saved'), title, _data.name || initialValues.name);

      // Retrieve the modified fields from the schema
      const modified = Object.keys(getState().modified);
      // Imit the fields that have `skipSubmit` set to `true`
      const toDelete = findSkipSubmits({ fields }, modified);
      // Construct a list of fields to be submitted
      const toSubmit = modified.filter((field) => !toDelete.includes(field));

      // Build up the form data using the list and pull out endpoints and authentications
      const { endpoints: _endpoints = { default: {} }, authentications: _authentications = {}, ...rest } = pick(_data, toSubmit);
      // Convert endpoints and authentications back to an array
      const endpoints = Object.keys(_endpoints).map((key) => ({ role: key, ..._endpoints[key] }));
      let authentications = Object.keys(_authentications).map((key) => ({ authtype: key, ..._authentications[key] }));

      if (authentications.length === 0) {
        authentications = Object.keys(initialValues.authentications).map((key) => ({ authtype: key }));
      }

      // Construct the full form data with all the necessary items
      const data = trimFieldValue({
        ...rest,
        endpoints,
        authentications,
        ...(edit ? undefined : { type }),
        ddf: true,
      });

      const request = providerId ? API.patch(`/api/providers/${providerId}`, data) : API.post('/api/providers', data);
      request.then(() => miqRedirectBack(message, 'success', redirect)).catch(miqSparkleOff);
    }
  };

  const componentMapper = {
    ...mapper,
    'protocol-selector': ProtocolSelector,
    'provider-credentials': ProviderCredentials,
    'validate-provider-credentials': ValidateProviderCredentials,
    'detect-button': DetectButton,
  };

  return (
    <div>
      { fields && (
        <EditingContext.Provider value={{ providerId, setState }}>
          <MiqFormRenderer
            componentMapper={componentMapper}
            schema={{ fields }}
            onSubmit={onSubmit}
            onCancel={onCancel}
            initialValues={initialValues}
            clearedValue={null}
            buttonsLabels={{ submitLabel }}
            canReset={edit}
            clearOnUnmount
            keepDirtyOnReinitilize
          />
        </EditingContext.Provider>
      ) }
    </div>
  );
};

ProviderForm.propTypes = {
  providerId: PropTypes.string,
  kind: PropTypes.string,
  title: PropTypes.string,
  redirect: PropTypes.string,
};

ProviderForm.defaultProps = {
  providerId: undefined,
  kind: undefined,
  title: undefined,
  redirect: undefined,
};

export default ProviderForm;

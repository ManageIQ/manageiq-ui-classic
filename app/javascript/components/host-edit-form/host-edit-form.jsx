/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { keyBy } from 'lodash';
import EditingContext from './editing-context';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './host-edit-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import ProtocolSelector from '../provider-form/protocol-selector';
import ValidateHostCredentials from './validate-host-credentials';
import mapper from '../../forms/mappers/componentMapper';

const HostEditForm = ({ ids }) => {
  const [{
    initialValues, isLoading, fields,
  }, setState] = useState({
    isLoading: (ids.length <= 1),
    fields: [],
  });

  const loadSchema = (response, appendState = {}) => {
    setState((state) => ({
      ...state,
      ...appendState,
      isLoading: false,
      initialValues: appendState,
      fields: response.data.form_schema.fields,
    }));
  };

  const getHostData = (id) => {
    miqSparkleOn();
    API.get(`/api/hosts/${id}?expand=resources&attributes=authentications`).then((initialValues) => {
      const authentications = initialValues ? keyBy(initialValues.authentications, 'authtype') : {};
      initialValues.host_validate_against = id;
      const foo = {
        ...initialValues,
        authentications,
      };
      API.options(`/api/hosts/${id}`).then((values) => loadSchema(values, foo)).then(miqSparkleOff);
    });
  };

  const emptySchema = (appendState = {}) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields: [],
    }));
  };

  const onReset = () => {
    if (ids.length > 1) {
      setState((state) => ({
        ...state,
        initialValues: {},
        fields: [],
      }));
    }
  };

  useEffect(() => {
    if (ids.length === 1) {
      getHostData(ids[0]);
    }
    setState((state) => ({ ...state, isLoading: false }));
  }, [ids]);

  const onSubmit = (values) => {
    miqSparkleOn();

    const resources = [];
    ids.forEach((id) => {
      resources.push({ authentications: values.authentications, id });
    });
    const payload = {
      action: 'edit',
      resources,
    };
    const selectedHostId = ids.length === 1 ? ids[0] : values.host_validate_against;
    const request = API.post(`/api/hosts/${selectedHostId}`, payload);

    request.then(() => {
      const message = ids.length === 1 ? sprintf(__('Modification of Host %s has been successfully queued.'), values.name)
        : __('Modification of multiple Hosts has been successfully queued.');
      miqRedirectBack(message, 'success', `/host/show/${selectedHostId}`);
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    let message = '';
    let url = '';
    if (ids.length === 1) {
      message = sprintf(__(`Edit of Host "%s" was cancelled.`), initialValues.name);
      url = `/host/show/${initialValues.id}`;
    } else {
      message = __(`Edit of Hosts was cancelled.`);
      url = '/host/show_list';
    }
    miqRedirectBack(message, 'success', url);
  };

  const componentMapper = {
    ...mapper,
    'protocol-selector': ProtocolSelector,
    'validate-host-credentials': ValidateHostCredentials,
  };

  return !isLoading && (
    <EditingContext.Provider value={{ ids, initialValues, setState }}>
      <MiqFormRenderer
        componentMapper={componentMapper}
        schema={createSchema(ids, fields, emptySchema, getHostData)}
        initialValues={initialValues}
        canReset
        onReset={onReset}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </EditingContext.Provider>
  );
};

HostEditForm.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.any),
};

HostEditForm.defaultProps = {
  ids: [],
};

export default HostEditForm;

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './policy-profile-form.schema';

const PolicyProfileForm = ({ recordId }) => {
  const [{ isLoading, options, initialValues }, setState] = useState({ isLoading: !!recordId });
  const addDescription = (string1, string2) => `${string1} : ${string2}`;

  useEffect(() => {
    API.get('/api/policies?attributes=id,description,towhat&expand=resources').then(({ resources }) => {
      const _options = resources.map(({ id, description, towhat }) => ({ value: id, label: addDescription(towhat, description) }));

      if (recordId) {
        API.get(
          `/api/policy_profiles/${recordId}?attributes=name,description,set_data,miq_policies&expand=miq_policies`
        // eslint-disable-next-line camelcase
        ).then(({ miq_policies, ...initialValues }) => setState({
          initialValues: {
            policies: miq_policies.map(({ id }) => id),
            ...initialValues,
          },
          options: _options,
          isLoading: false,
        }));
      } else {
        setState({
          options: _options,
          isLoading: false,
        });
      }
    });
  }, [recordId]);

  const onSubmit = ({ policies, ...values }) => {
    miqSparkleOn();
    const data = { ...values, miq_policy_ids: policies };

    const request = recordId ? API.patch(`/api/policy_profiles/${recordId}`, data) : API.post('/api/policy_profiles', data);

    request.then(() => {
      const message = sprintf(__('Policy Profile "%s" was saved.'), values.description);
      miqRedirectBack(message, 'success', '/miq_policy_set/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Policy Profile "%s" was canceled by the user.')
        : __('Creation of new Policy Profile was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/miq_policy_set/show_list');
  };

  if (isLoading || (options === undefined)) return <Loading className="export-spinner" withOverlay={false} small />;

  return (!isLoading && options) && (
    <MiqFormRenderer
      schema={createSchema(options)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canReset={!!recordId}
      buttonsLabels={{
        submitLabel: recordId ? __('Save') : __('Add'),
      }}
    />
  );
};

PolicyProfileForm.propTypes = {
  recordId: PropTypes.string,
};

PolicyProfileForm.defaultProps = {
  recordId: undefined,
};

export default PolicyProfileForm;

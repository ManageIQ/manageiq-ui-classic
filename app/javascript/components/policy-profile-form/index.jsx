import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';

import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './policy-profile-form.schema';

const PolicyProfileForm = ({ recordId }) => {
  const [{ isLoading, options, initialValues }, setState] = useState({ isLoading: !!recordId });

  useEffect(() => {
    API.get('/api/policies?attributes=id,display_name&expand=resources').then(({ resources }) => {
      const _options = resources.map(({ id, display_name }) => ({ key: id, label: display_name }));

      if (recordId) {
        API.get(
          `/api/policy_profiles/${recordId}?attributes=name,description,set_data,miq_policies&expand=miq_policies`
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

    const data = { ...values, miq_policies: policies };

    const request = recordId ? API.patch(`/api/policy_profiles/${recordId}`, data) : API.post('/api/policy_profiles', data);

    request.then(() => {
      const message = sprintf(__('Policy Profile "%s" was saved.'), values.name);
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

  return !isLoading && (
    <Grid>
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
    </Grid>
  );
};

PolicyProfileForm.propTypes = {
  recordId: PropTypes.string,
};

PolicyProfileForm.defaultProps = {
  recordId: undefined,
};

export default PolicyProfileForm;

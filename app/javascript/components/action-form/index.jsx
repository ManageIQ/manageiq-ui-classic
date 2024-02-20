import React, { useState, useEffect, useMemo } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './action-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { dataHelper, constructAeHash } from './helper';

const ActionForm = ({
  recordId, inheritTags, availableAlerts, tags, ansibleInventory, snapshotAge, parentType, inventoryType,
}) => {
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!recordId,
  });

  const submitLabel = !!recordId ? __('Save') : __('Add');
  const promise = useMemo(() => API.options('/api/actions'), []);

  const onSubmit = (values) => {
    miqSparkleOn();
    const data = dataHelper(values);

    const request = recordId ? API.patch(`/api/actions/${recordId}`, data) : API.post('/api/actions', data);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('New action "%s" has been successfully queued.')
          : __('Add of action "%s" has been successfully queued.'),
        data.name,
      );
      const url = recordId ? `/miq_action/show/${recordId}` : '/miq_action/show_list';
      miqRedirectBack(message, 'success', url);
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Action "%s" was canceled by the user.')
        : __('Creation of new Action was canceled by the user.'),
      initialValues && initialValues.name,
    );
    const url = recordId ? `/miq_action/show/${recordId}` : '/miq_action/show_list';
    miqRedirectBack(message, 'warning', url);
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/actions/${recordId}`).then((initialValues) => {
        if (initialValues.action_type === 'custom_automation') {
          initialValues.options.ae_hash = constructAeHash(initialValues.options.ae_hash);
          setState({ initialValues, isLoading: false });
        } else if (initialValues.action_type === 'tag') {
          // eslint-disable-next-line no-useless-escape
          initialValues.options.tags = initialValues.options.tags[0].replace('\/managed\/', '');
          setState({ initialValues, isLoading: false });
        } else {
          setState({ initialValues, isLoading: false });
        }
      });
    }
  }, [recordId]);

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(!!recordId, promise, inheritTags, availableAlerts, tags, ansibleInventory, snapshotAge, parentType, inventoryType)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

ActionForm.propTypes = {
  inheritTags: PropTypes.arrayOf(PropTypes.any).isRequired,
  availableAlerts: PropTypes.arrayOf(PropTypes.any).isRequired,
  recordId: PropTypes.string,
  tags: PropTypes.objectOf(PropTypes.any).isRequired,
  ansibleInventory: PropTypes.arrayOf(PropTypes.any).isRequired,
  snapshotAge: PropTypes.arrayOf(PropTypes.any).isRequired,
  parentType: PropTypes.arrayOf(PropTypes.any).isRequired,
  inventoryType: PropTypes.string,
};

ActionForm.defaultProps = {
  recordId: undefined,
  inventoryType: undefined,
};

export default ActionForm;

import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { http } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './domains-priority-form.schema';

/**
 * DomainsPriorityForm - React component for editing domain priority order
 * Allows users to reorder automate domains via drag-and-drop
 */
const DomainsPriorityForm = ({ domainOrder }) => {
  const initialValues = {
    domain_order: domainOrder,
  };

  const onSubmit = (values) => {
    miqSparkleOn();

    // The backend expects domain names in reverse order (highest priority last)
    const reversedOrder = [...values.domain_order].reverse();

    const params = {
      domain_order: reversedOrder,
      button: 'save',
    };

    return http.post('/miq_ae_class/domains_priority_edit', params, { skipErrors: [400] })
      .then((response) => {
        const message = response.message || __('Priority Order was saved');
        const level = response.level || 'success';
        miqRedirectBack(message, level, '/miq_ae_class/explorer');
      })
      .catch((error) => {
        const message = error.data?.message || error.message || __('Error saving priority order');
        const level = error.data?.level || 'error';
        miqRedirectBack(message, level, '/miq_ae_class/explorer');
      });
  };

  const onCancel = () => {
    const message = __('Edit of Priority Order was cancelled by the user');
    miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  };

  return (
    <div className="domains-priority-form">
      <MiqFormRenderer
        schema={createSchema(domainOrder)}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        buttonsLabels={{
          submitLabel: __('Save'),
          cancelLabel: __('Cancel'),
          resetLabel: __('Reset'),
        }}
        canReset
      />
    </div>
  );
};

DomainsPriorityForm.propTypes = {
  domainOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default DomainsPriorityForm;

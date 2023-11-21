import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import { buildOrderServiceFields } from './helper';
import createSchema from './service-dialog';
import mapper from '../../forms/mappers/componentMapper';
import OrderServiceRefreshButton from '../order-service-form/order-service-refresh-button';
import OrderServiceContext from '../order-service-form/OrderServiceContext';

const ServiceDialog = ({ recordId, initialValues, from }) => {
  const componentMapper = {
    ...mapper,
    'refresh-button': OrderServiceRefreshButton,
  };

  const [data, setData] = useState({
    isLoading: true,
    fields: undefined,
  });

  useEffect(() => {
    const serviceDialogsUrl = [`/api/service_dialogs/${recordId}`];

    API.get(serviceDialogsUrl, { skipErrors: [500] })
      .then((response) => {
        setData({
          isLoading: false,
          fields: buildOrderServiceFields(response, initialValues, from),
        });
      });
  }, []);

  return (
    <div className={`service-dialog-wrapper ${from}`}>
      {
        data.isLoading && (
          <div className="loadingSpinner">
            <Loading active small withOverlay={false} className="loading" />
          </div>
        )
      }
      {
        !data.isLoading && (
          <OrderServiceContext.Provider value={{ currentRefreshField: null, setCurrentRefreshField: null }}>
            <MiqFormRenderer
              FormTemplate={(props) => <FormTemplate {...props} fields={data.fields} />}
              componentMapper={componentMapper}
              schema={createSchema(data.fields)}
              initialValues={initialValues}
            />
          </OrderServiceContext.Provider>
        )
      }
    </div>
  );
};

const FormTemplate = ({ formFields }) => (
  <form id="order-service-form">
    {formFields}
    <FormSpy>
      {() => (
        <div className="custom-button-wrapper" />
      )}
    </FormSpy>
  </form>
);

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

ServiceDialog.propTypes = {
  recordId: PropTypes.number.isRequired,
  initialValues: PropTypes.shape({}),
  from: PropTypes.string.isRequired,
};

ServiceDialog.defaultProps = {
  initialValues: undefined,
};

export default ServiceDialog;

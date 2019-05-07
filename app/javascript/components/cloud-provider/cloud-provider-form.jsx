import React, { useReducer, useEffect } from 'react';
import { Grid, Row, Col } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createCloudProviderschema from './cloud-provider-form.schema';
import { loadFormData } from './cloud-provider-helper';

const SET_FORM_OPTIONS = 'SET_FORM_OPTIONS';

const initialState = {
  serverZones: [],
  emsTypes: [],
  isLoaded: false,
};

const cloudProviderFormReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_FORM_OPTIONS:
      return { ...state, ...payload, isLoaded: true };
    default: throw new Error(`Tried to update Cloud Provider reducer with uknown action type: ${type}`);
  }
};

const CloudProviderForm = ({
  providerRegions,
  openStackApiVersion,
  vmWareCloudApiVersions,
  openstackSecurityProtocols,
  amqpSecurityProtocol,
}) => {
  const [state, dispatch] = useReducer(cloudProviderFormReducer, initialState);

  useEffect(() => {
    miqSparkleOn();
    loadFormData()
      .then(formData => dispatch({ type: SET_FORM_OPTIONS, payload: formData }))
      .then(miqSparkleOff);
  }, []);

  const {
    serverZones,
    isLoaded,
    emsTypes,
    openstackInfraProviders,
  } = state;

  const handleSubmit = (values) => {
    console.log('Cloud provider form', values);
    return values;
  };

  if (!isLoaded) return null;
  return (
    <Grid fluid>
      <Row>
        <Col md={6}>
          <h1>There will be dragons</h1>
          <MiqFormRenderer
            onSubmit={handleSubmit}
            onCancel={() => console.log('Cancel clicked')}
            buttonsLabels={{
              submitLabel: __('Add'),
            }}
            schema={createCloudProviderschema(
              emsTypes,
              serverZones,
              providerRegions,
              openStackApiVersion,
              openstackInfraProviders,
              vmWareCloudApiVersions,
              openstackSecurityProtocols,
              amqpSecurityProtocol,
            )}
          />
        </Col>
      </Row>
    </Grid>
  );
};

export default CloudProviderForm;

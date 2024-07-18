import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './automate-simulation.schema';
import miqRedirectBack from '../../../../app/javascript/helpers/miq-redirect-back';

const AutomateSimulation = ({ resolve, title, max_name_length, url, ae_ansible_custom_button, form_action, ae_custom_button, attr_values_pairs, maxlength }) => {

  const handleSubmit = (values) => {
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => {
      const message = __('Automation Simulation options submitted');
      const url = '/miq_ae_tools/resolve'
      miqRedirectBack(message, 'success', url);
    })
    .catch(error => {
      miqRedirectBack(error, 'error', url);
    });
  };

  return(
    <MiqFormRenderer 
      schema={createSchema(resolve, max_name_length, url, ae_ansible_custom_button, form_action, ae_custom_button, attr_values_pairs, maxlength)}
      onSubmit={handleSubmit}
    />
  );
};

AutomateSimulation.propTypes = {
  resolve: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  max_name_length: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  ae_ansible_custom_button: PropTypes.bool.isRequired,
  form_action: PropTypes.string.isRequired,
  ae_custom_button: PropTypes.bool.isRequired,
  attr_values_pairs: PropTypes.array.isRequired,
  maxlength: PropTypes.number.isRequired,
};
  
AutomateSimulation.defaultProps = {
  recordId: undefined,
  title: undefined,
  max_name_length: undefined,
  url: undefined,
  ae_ansible_custom_button: undefined,
  form_action: undefined,
  ae_custom_button: undefined,
  attr_values_pairs: undefined,
  maxlength: undefined,
};
export default AutomateSimulation;

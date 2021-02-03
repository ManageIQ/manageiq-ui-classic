import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import YAML from 'yaml';

import MiqFormRenderer from '@@ddf';
import createSchema from './advanced-settings-form.schema';

const AdvancedSettingsForm = ({ url }) => {
  const [{ isLoading, initialValues }, setState] = useState({ isLoading: true });

  useEffect(() => {
    API.get(url).then((settings) => setState({
      initialValues: { // It is coming in as JSON but we need YAML
        settings: YAML.stringify(settings),
      },
      isLoading: false,
    }));
  }, [url]);

  const onSubmit = ({ settings }) => {
    miqSparkleOn();
    // The API expects us to send a JSON
    API.patch(url, YAML.parse(settings)).then(() => {
      add_flash(__('Configuration changes saved'), 'success');
      // Scroll to the top of the page to see the flash message
      document.querySelector('#flash_msg_div').scrollIntoView(false);
      miqSparkleOff();
    }).catch(miqSparkleOff);
  };

  return !isLoading && (
    <>
      <div />
      <MiqFormRenderer
        schema={createSchema()}
        initialValues={initialValues}
        onSubmit={onSubmit}
        canReset
      />
    </>
  );
};

AdvancedSettingsForm.propTypes = {
  url: PropTypes.string.isRequired,
};

export default AdvancedSettingsForm;

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import { FinalFormField } from '@manageiq/react-ui-components/dist/forms';
import { cleanVirtualDom } from '../../miq-component/helpers';
import { required } from '../../forms/validators';

const BasicReportInfo = ({ name, title, url }) => {
  // set Initial values if editing
  const [initialValues] = useState({ name, title });
  // deletes unused components from virtual DOM
  useEffect(() => cleanVirtualDom());
  return (
    <Form initialValues={initialValues} onSubmit={() => {}}>
      {() => (
        <React.Fragment>
          <Field
            label={__('Menu Name')}
            name="name"
            id="name"
            maxLength={40}
            validate={required}
            extraProps={{
              'data-miq_observe': `{"interval" : ".5", "url": "${url}"}`,
            }}
            component={FinalFormField}
          />
          <Field
            label={__('Title')}
            name="title"
            id="title"
            maxLength={60}
            validate={required}
            extraProps={{
              'data-miq_observe': `{"interval" : ".5", "url": "${url}"}`,
            }}
            component={FinalFormField}
          />
        </React.Fragment>
      )}
    </Form>
  );
};

BasicReportInfo.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
};

BasicReportInfo.defaultProps = {
  name: undefined,
  title: undefined,
};

export default BasicReportInfo;

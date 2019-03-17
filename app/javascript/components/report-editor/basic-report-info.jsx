import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import { FinalFormField } from '@manageiq/react-ui-components/dist/forms';
import { cleanVirtualDom } from '../../miq-component/helpers';
import { required } from '../../forms/validators';

const formRequest = (data, url, options) => miqAjax(url, data, options);

const onBlur = (event, onBlur, name, state, url) => {
  onBlur(event);
  formRequest({ [name]: state[name] }, url, {observeQueue: true});
};

const BasicReportInfo = ({ name, title, url }) => {
  // set Initial values if editing
  const [initialValues] = useState({ name, title });
  // deletes unused components from virtual DOM
  useEffect(() => cleanVirtualDom());
  return (
    <Form initialValues={initialValues} onSubmit={() => {}}>
      {({ form: { getState } }) => (
        <React.Fragment>
          <Field
            label={__('Menu Name')}
            name="name"
            id="name"
            maxLength={40}
            validate={required}
            render={({ input, ...rest }) => (
              <FinalFormField
                input={{ ...input, onBlur: event => onBlur(event, input.onBlur, input.name, getState().values, url) }}
                {...rest}
              />)}
          />
          <Field
            label={__('Title')}
            name="title"
            id="title"
            maxLength={60}
            validate={required}
            render={({ input, ...rest }) => (
              <FinalFormField
                input={{ ...input, onBlur: event => onBlur(event, input.onBlur, input.name, getState().values, url) }}
                {...rest}
              />)}
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

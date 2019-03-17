import React from 'react';
import { Field, Form } from 'react-final-form';
import { FinalFormSelect } from '@manageiq/react-ui-components/dist/forms';

const ReportCreationTimeout = ({ opts, timeout, url }) => {
  const options = opts.map(([label, value]) => ({ value, label }));
  return (
    <Form
      initialValues={{
        chosen_queue_timeout: timeout === null ? undefined : timeout,
      }}
      onSubmit={() => {}}
    >
      {() => (
        <Field
          name="chosen_queue_timeout"
          label={__('Cancel after')}
          placeholder={options[0].label}
          render={({ input, ...props }) => (
            <FinalFormSelect
              input={{
                ...input,
                onChange: ((value) => {
                  miqAjax(`${url}?chosen_queue_timeout=${value}`, {});
                  input.onChange(value);
                }),
              }}
              {...props}
            />
          )}
          options={options}
        />
      )}
    </Form>
  );
};

export default ReportCreationTimeout;

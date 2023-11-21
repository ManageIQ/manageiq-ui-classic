import React, { useContext, useMemo } from 'react';
import { Button } from 'carbon-components-react';
import ServiceContext from './ServiceContext';
import { omitValidation } from './helper';

const ServiceButtons = React.memo(() => {
  const { data } = useContext(ServiceContext);

  const formValid = useMemo(() =>
    Object.values(data.dialogFields).every((field) => field.valid),
  [data.dialogFields]);

  const submitForm = () => {
    const values = omitValidation(data.dialogFields);
    console.log(values);
  };

  return (
    <div>
      <Button
        disabled={!formValid}
        onClick={submitForm}
      >
        {__('Submit')}
      </Button>

      <Button kind="secondary">
        {__('Cancel')}
      </Button>
    </div>
  );
});

export default ServiceButtons;

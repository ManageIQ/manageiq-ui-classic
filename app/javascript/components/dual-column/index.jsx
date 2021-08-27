import React from 'react';

import { useFormApi } from '@@ddf';
import { Grid, Row, Column } from 'carbon-components-react';

const DualColumnComponent = ({ name, fields }) => {
  const { renderForm } = useFormApi();

  return (
    <Grid>
      <Row>
        {fields.map((field) => (
          <Column key={field.name}>
            {field.name = name + '.' + field.component, renderForm([field])}
          </Column>
        ))}
      </Row>
    </Grid>
  );
};

export default DualColumnComponent;
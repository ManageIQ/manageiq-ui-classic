import React from 'react';
import { Col, Row } from 'patternfly-react';
import PropTypes from 'prop-types';
import { useFormApi } from '@@ddf';

const Dualgroup = ({ name, fields }) => {
  const formOptions = useFormApi();

  if (![0, 1, 2, 3, 4, 6, 12].includes(fields.length)) {
    throw Error(`Length of fields (DualGroup component: ${name}) has to be a divisor of 12: 1,2,3,4,6,12. You have: ${fields.length}`);
  }

  return (
    <React.Fragment>
      <Row>
        {
        fields.map(field => (
          <Col key={field.name} md={(12 / fields.length)}>{formOptions.renderForm([field], formOptions)}</Col>
        ))
      }
      </Row>
      <hr style={{ margin: 0 }} />
    </React.Fragment>
  );
};

Dualgroup.propTypes = {
  name: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Dualgroup;

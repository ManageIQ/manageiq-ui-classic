import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Col, Button } from 'patternfly-react';
import { useFormApi } from '@@ddf';

const FieldArrayItem = ({
  FieldProvider,
  fields,
  fieldIndex,
  name,
  value,
  remove,
  colsize,
}) => {
  const formOptions = useFormApi();

  return (
    <div className="field-array-item">
      { fields.map(({ label: _label, ...field }, index) => (
        <Col xs={colsize} key={index}>{ formOptions.renderForm([field]) }</Col>
      )) }
      <Col xs={2}>
        <Button className="field-array-item-remove" onClick={() => remove(fieldIndex)}>
          { __('Remove') }
        </Button>
      </Col>
    </div>
  );
};

FieldArrayItem.propTypes = {
  FieldProvider: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.func]).isRequired,
  fields: PropTypes.any.isRequired,
  fieldIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  remove: PropTypes.func.isRequired,
  colsize: PropTypes.number.isRequired,
};

export default FieldArrayItem;

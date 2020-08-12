import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, FormGroup } from 'patternfly-react';

import { useFormApi, FieldArray } from '@@ddf';
import FieldArrayItem from './field-array-item';

const FieldArrayComponent = ({
  arrayValidator,
  label,
  fields,
  itemDefault,
  addText,
  ...rest
}) => {
  const { name } = rest.input;
  const colsize = Math.floor(10 / fields.length);
  const formOptions = useFormApi();

  const header = (
    <Row>
      <div className="field-array-header">
        { fields.map(({ label }, index) => (
          <Col xs={colsize} key={index}><label>{ label }</label></Col>
        )) }
        <Col xs={2}><label>{ __('Actions') }</label></Col>
      </div>
    </Row>
  );

  return (
    <FieldArray name={name} validate={arrayValidator}>
      { ({ fields: { length, map, value, push, remove } }) => (
        <div className="field-array">
          <h3>{ label }</h3>
          { length && length > 0 && header }
          {
            map((option, index) => (
              <Row key={index}>
                <FieldArrayItem
                  name={option}
                  fields={fields}
                  value={value[index].value}
                  fieldIndex={index}
                  formOptions={formOptions}
                  remove={remove}
                  colsize={colsize}
                />
              </Row>
            ))
          }
          <FormGroup>
            <Button bsStyle="primary" className="field-array-item-add pull-right" onClick={() => push(itemDefault)}>
              { addText }
            </Button>
            <div className="clearfix" />
          </FormGroup>
        </div>
      )}
    </FieldArray>
  );
};

FieldArrayComponent.propTypes = {
  FieldArrayProvider: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.func]).isRequired,
  arrayValidator: PropTypes.func,
  label: PropTypes.string,
  fields: PropTypes.any.isRequired,
  itemDefault: PropTypes.any,
  addText: PropTypes.string,
};

FieldArrayComponent.defaultProps = {
  arrayValidator: undefined,
  label: undefined,
  addText: __('New option'),
  itemDefault: {},
};

export default FieldArrayComponent;

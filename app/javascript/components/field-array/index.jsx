import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, FormGroup } from 'patternfly-react';

import { useFormApi } from '@@ddf';
import FieldArrayItem from './field-array-item';

const FieldArray = ({
  FieldProvider,
  FieldArrayProvider,
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
    <FieldArrayProvider name={name} validate={arrayValidator}>
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
                  FieldProvider={FieldProvider}
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
    </FieldArrayProvider>
  );
};

FieldArray.propTypes = {
  FieldProvider: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.func]).isRequired,
  FieldArrayProvider: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.func]).isRequired,
  arrayValidator: PropTypes.func,
  label: PropTypes.string,
  fields: PropTypes.any.isRequired,
  itemDefault: PropTypes.any,
  addText: PropTypes.string,
};

FieldArray.defaultProps = {
  arrayValidator: undefined,
  label: undefined,
  addText: __('New option'),
  itemDefault: {},
};

export default FieldArray;

import React from 'react';
import PropTypes from 'prop-types';
import { Col, ControlLabel, FormGroup } from 'patternfly-react';
import ValueSelector from './ValueSelector';
import { __ } from '../../../global-functions';
import TaggingPropTypes from '../TaggingPropTypes';

const ValueModifier = ({
  values,
  onTagValueChange,
  selectedTagValue,
  multiValue,
  valueLabel,
}) => (
  <FormGroup>
    <Col xs={12} md={4} lg={4}>
      <ControlLabel>{valueLabel}</ControlLabel>
    </Col>
    <Col xs={12} md={8} lg={8}>
      <ValueSelector
        values={values}
        onTagValueChange={onTagValueChange}
        selectedOption={selectedTagValue}
        multiValue={multiValue}
      />
    </Col>
  </FormGroup>
);

ValueModifier.propTypes = {
  selectedTagValue: TaggingPropTypes.value,
  onTagValueChange: PropTypes.func.isRequired,
  valueLabel: PropTypes.string,
  multiValue: PropTypes.bool,
  values: PropTypes.arrayOf(TaggingPropTypes.value).isRequired,
};

ValueModifier.defaultProps = {
  valueLabel: __('Value'),
  multiValue: true,
};

export default ValueModifier;

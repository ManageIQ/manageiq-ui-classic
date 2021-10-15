import React from 'react';
import PropTypes from 'prop-types';
import { Column, FormLabel, FormGroup } from 'carbon-components-react';
import ValueSelector from './ValueSelector';
import TaggingPropTypes from '../TaggingPropTypes';

const ValueModifier = ({
  values,
  onTagValueChange,
  selectedTagValues,
  multiValue,
  valueLabel,
  isDisabled,
}) => (
  <FormGroup legendText="">
    <Column xs={12} md={4} lg={4}>
      <FormLabel><b>{valueLabel}</b></FormLabel>
    </Column>
    <Column xs={12} md={8} lg={8}>
      <ValueSelector
        values={values}
        onTagValueChange={onTagValueChange}
        selectedOption={selectedTagValues}
        multiValue={multiValue}
        isDisabled={isDisabled}
      />
    </Column>
  </FormGroup>
);

ValueModifier.propTypes = {
  selectedTagValues: PropTypes.arrayOf(TaggingPropTypes.value),
  onTagValueChange: PropTypes.func.isRequired,
  valueLabel: PropTypes.string,
  multiValue: PropTypes.bool,
  values: PropTypes.arrayOf(TaggingPropTypes.value).isRequired,
  isDisabled: PropTypes.bool,
};

ValueModifier.defaultProps = {
  selectedTagValues: {},
  valueLabel: __('Value'),
  multiValue: true,
  isDisabled: false,
};

export default ValueModifier;

import React from 'react';
import PropTypes from 'prop-types';
import { Column, FormGroup } from 'carbon-components-react';
import ValueSelector from './ValueSelector';
import TaggingPropTypes from '../TaggingPropTypes';

const ValueModifier = ({
  selectedTagCategory,
  values,
  onTagValueChange,
  selectedTagValues,
  multiValue,
  valueLabel,
  isDisabled,
}) => (
  <FormGroup legendText={valueLabel}>
    <Column className="tag-modifier-form-row value-modifier">
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
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
  selectedTagCategory: PropTypes.string.isRequired,
  selectedTagValues: PropTypes.arrayOf(TaggingPropTypes.value),
  onTagValueChange: PropTypes.func.isRequired,
  valueLabel: PropTypes.string,
  multiValue: PropTypes.bool,
  values: PropTypes.arrayOf(TaggingPropTypes.value).isRequired,
  isDisabled: PropTypes.bool,
};

ValueModifier.defaultProps = {
  selectedTagValues: [],
  valueLabel: __('Value'),
  multiValue: true,
  isDisabled: false,
};

export default ValueModifier;

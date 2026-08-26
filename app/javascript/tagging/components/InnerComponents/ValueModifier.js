import PropTypes from 'prop-types';
import { Column, FormGroup } from '@carbon/react';
import ValueSelector from './ValueSelector';
import TaggingPropTypes from '../TaggingPropTypes';

const ValueModifier = ({
  selectedTagCategory,
  values,
  onTagValueChange,
  selectedTagValues = [],
  multiValue = true,
  valueLabel = __('Value'),
  isDisabled = false,
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
  selectedTagCategory: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
  }).isRequired,
  selectedTagValues: PropTypes.arrayOf(TaggingPropTypes.value),
  onTagValueChange: PropTypes.func.isRequired,
  valueLabel: PropTypes.string,
  multiValue: PropTypes.bool,
  values: PropTypes.arrayOf(TaggingPropTypes.value).isRequired,
  isDisabled: PropTypes.bool,
};

export default ValueModifier;

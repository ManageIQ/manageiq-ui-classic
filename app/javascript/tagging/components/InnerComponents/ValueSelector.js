import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { __ } from '../../../global-functions';
import TaggingPropTypes from '../TaggingPropTypes';
import customStyles from '../../../forms/select-styles';

class ValueSelector extends React.Component {
  getValues = values =>
    values.map(tag => ({ value: tag.id, label: tag.description }));

  /**
   * Maps the selected options for the select box input.
   *
   */
  getActiveValues = () => {
    if (this.props.selectedOption.length > 0) {
      return this.props.selectedOption.map(el => ({ value: el.id, label: el.description }));
    }
    return [];
  };

  /**
   * Handles the single and multi select value changes.
   *
   * Sends an Array of {description, id} to the callback.
   * If null is received sends and empty array instead
   * (happens when removing elements one by one).
   * On reset button (multi select) sends the default empty array.
   *
   * @param values {label, value}[] Currently selected values.
   */
  handleChange = (values) => {
    // Deleting all the multi selected items
    if (values === null) {
      return this.props.onTagValueChange([]);
    }

    // Multi select
    if (Array.isArray(values)) {
      return this.props.onTagValueChange(values.map(el => ({
        description: el.label,
        id: el.value,
      })));
    }

    // Single select
    return this.props.onTagValueChange([{
      description: values.label,
      id: values.value,
    }]);
  };

  selector = (value, values) => (
    <Select
      id="cat_tags_div"
      className="final-form-select"
      classNamePrefix="react-select"
      clearable={false}
      value={value}
      isMulti={this.props.multiValue}
      ignoreCase
      name="form-field-name"
      noOptionsMessage={() => __('No options')}
      options={values}
      optionClassName="selected-option final-form-select-option"
      onChange={this.handleChange}
      placeholder={__('Select tag value')}
      styles={customStyles}
    />
  );

  render() {
    return this.selector(
      this.getActiveValues(),
      this.getValues(this.props.values),
    );
  }
}

ValueSelector.propTypes = {
  selectedOption: PropTypes.arrayOf(TaggingPropTypes.value),
  values: PropTypes.arrayOf(TaggingPropTypes.value).isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  multiValue: PropTypes.bool,
};

ValueSelector.defaultProps = {
  multiValue: false,
  selectedOption: [],
};

export default ValueSelector;

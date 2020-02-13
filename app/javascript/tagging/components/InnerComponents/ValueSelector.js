import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '../../../global-functions';
import TaggingPropTypes from '../TaggingPropTypes';
import Select from '../../../forms/pf-select';

class ValueSelector extends React.Component {
  getValues = values =>
    values.map(tag => ({ value: tag.id, label: tag.description }));

  /**
   * Maps the selected options for the select box input.
   *
   */
  getActiveValues = () => {
    if (this.props.selectedOption.length) {
      return this.props.multiValue
        ? this.props.selectedOption.map(el => el.id)
        : this.props.selectedOption[0].id;
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
   * @param val [] Currently selected values.
   */
  handleChange = (val) => {
    // Deleting all the multi selected items
    if (!val) {
      return this.props.onTagValueChange([]);
    }

    return this.props.onTagValueChange((this.props.values.filter(el => (Array.isArray(val) ? val.includes(el.id) : el.id === val))));
  };

  selector = (value, values) => (
    <Select
      meta={{}}
      options={values}
      input={{ onChange: this.handleChange, name: 'ValueSelector', value }}
      multi={this.props.multiValue}
      simpleValue
      clearable
      searchable={values.length > 0}
      placeholder={__('Select tag value')}
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

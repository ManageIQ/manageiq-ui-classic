import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MultiSelect } from 'carbon-components-react';
import TaggingPropTypes from '../TaggingPropTypes';

class ValueSelector extends React.Component {
  getValues = (values) =>
    values.map((tag) => ({ value: tag.id, label: tag.description }));

  /**
   * Maps the selected options for the select box input.
   *
   */
  getActiveValues = () => {
    const { selectedOption, multiValue } = this.props;
    if (selectedOption.length) {
      return multiValue
        ? selectedOption.map((el) => el.id)
        : selectedOption[0].id;
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
    const { selectedItem, selectedItems } = val;
    const { onTagValueChange, values } = this.props;
    let selection;
    if (selectedItem) {
      selection = selectedItem;
    } else {
      selection = selectedItems;
    }
    // Deleting all the multi selected items
    const arrayIds = [];
    if (selectedItems) {
      if (selectedItems.length !== 0) {
        selectedItems.forEach((item) => {
          arrayIds.push(item.value);
        });
      } else {
        return onTagValueChange([]);
      }
    }
    return onTagValueChange((values.filter((el) => (Array.isArray(selection) ? arrayIds.includes(el.id) : el.id === selection.value))));
  };

  getOptions = (values) => {
    const options = [];
    values.forEach((item) => (
      options.push(
        { key: item.value, value: item.value, label: item.label }
      )
    ));
    return options;
  }

  selector = (value, values) => {
    const { isDisabled, multiValue, selectedOption } = this.props;
    let label = '';
    const selectedOptions = [];
    if (selectedOption.length !== 0) {
      if (selectedOption.length === 1) {
        label = `${selectedOption[0].description}`;
        if (multiValue) {
          selectedOptions.push({
            label: selectedOption[0].description,
            value: selectedOption[0].id,
          });
        }
      } else {
        selectedOption.forEach((option) => {
          selectedOptions.push({
            label: option.description,
            value: option.id,
          });
          if (label === '') {
            label = `${option.description}`;
          } else {
            label = `${label}, ${option.description}`;
          }
        });
      }
    } else {
      label = `${__('Select tag value')}`;
    }
    if (multiValue) {
      return (
        <MultiSelect
          className="tag-select"
          id="tag-select"
          open
          label={label}
          initialSelectedItems={selectedOptions}
          // eslint-disable-next-line react/destructuring-assignment
          key={selectedOptions.length === 0 ? -1 : this.props.values[0].id + selectedOptions.length}
          items={values}
          disabled={isDisabled}
          onChange={(val) => this.handleChange(val)}
        />
      );
    }

    return (
      <Dropdown
        className="tag-select"
        id="tag-select"
        label={label}
        defaultValue="placeholder"
        // eslint-disable-next-line react/destructuring-assignment
        key={selectedOption.length === 0 ? -1 : this.props.values[0].id}
        disabled={isDisabled}
        onChange={(val) => this.handleChange(val)}
        items={this.getOptions(values)}
      />
    );
  };

  render() {
    const { values } = this.props;
    return this.selector(
      this.getActiveValues(),
      this.getValues(values),
    );
  }
}

ValueSelector.propTypes = {
  selectedOption: PropTypes.arrayOf(TaggingPropTypes.value),
  values: PropTypes.arrayOf(TaggingPropTypes.value).isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  multiValue: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

ValueSelector.defaultProps = {
  multiValue: false,
  selectedOption: [],
  isDisabled: false,
};

export default ValueSelector;

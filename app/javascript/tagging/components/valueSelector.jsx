import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';


class ValueSelector extends React.Component {
  handleChange = (selectedOption) => {
    this.props.onTagValueChange({ description: selectedOption.label, id: selectedOption.value });
  }

  selector = (value, label, tagValues) => {
    return (this.props.multiValue && <Select
      name="form-field-name"
      value={value}
      label={label}
      onChange={this.handleChange}
      options={tagValues}
      clearable={false}
    />) ||
      <Select
        name="form-field-name"
        value={value}
        label={label}
        onChange={this.handleChange}
        options={tagValues}
        clearable={false}
      />;
  }

  render() {
    const value = this.props.selectedOption.id;
    const label = this.props.selectedOption.description;
    const tagValues = this.props.tagValues.map(tag => ({ value: tag.id, label: tag.description }));

    return this.selector(value, label, tagValues);
  }
}

ValueSelector.propTypes = {
  selectedOption: PropTypes.object.isRequired,
  tagValues: PropTypes.arrayOf(PropTypes.object),
  onTagValueChange: PropTypes.func.isRequired,
  multiValue: PropTypes.bool.isRequired,
};


ValueSelector.defaultProps = {
  multiValue: true,
};
export default ValueSelector;

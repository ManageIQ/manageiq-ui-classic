import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';


class ValueSelector extends React.Component {
  handleChange = (selectedOption) => {
    this.props.onTagValueChange({ description: selectedOption.label, id: selectedOption.value });
  }

  selector = () => {
    console.log('mluti val',this.props.multiValue);
    (this.props.multiValue && <Select
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
      />
  }

  render() {
    console.log('VALUE SELECTOR:', this.props);
    const value = this.props.selectedOption.id;
    const label = this.props.selectedOption.description;
    const tagValues = this.props.tagValues.map(tag => ({ value: tag.id, label: tag.description }));

    return (
      <Select
        name="form-field-name"
        value={value}
        label={label}
        onChange={this.handleChange}
        options={tagValues}
        clearable={false}
      />
    );
  }
}

ValueSelector.propTypes = {
  selectedOption: PropTypes.object.isRequired,
  tagValues: PropTypes.arrayOf(PropTypes.object),
  onTagValueChange: PropTypes.func.isRequired,
  multiValue: PropTypes.bool.isRequired,
};

ValueSelector.defaultProps = {
  multiValue: false,
}

export default ValueSelector;

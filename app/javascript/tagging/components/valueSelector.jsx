import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class ValueSelector extends React.Component {
  handleChange = (selectedOption) => {
    this.props.onTagValueChange(selectedOption);
  }

  render() {
    const value = this.props.selectedOption;
    const tagValues = this.props.tagValues.map(tag => ({ value: tag, label: tag }));

    return (
      <Select
        name="form-field-name"
        value={value}
        onChange={this.handleChange}
        options={tagValues}
        resetValue={{ label: '', value: '' }}
      />
    );
  }
}

ValueSelector.propTypes = {
  selectedOption: PropTypes.string.isRequired,
  tagValues: PropTypes.arrayOf(PropTypes.string),
  onTagValueChange: PropTypes.func.isRequired,
};

export default ValueSelector;

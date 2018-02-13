import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class TagSelector extends React.Component {
  handleChange = (selectedOption) => {
    this.props.onTagCategoryChange(selectedOption);
  }

  render() {
    const value = this.props.selectedOption;
    const tagCategories = this.props.tagCategories.map(tag => ({ value: tag, label: tag }));

    return (
      <Select
        name="form-field-name"
        value={value}
        onChange={this.handleChange}
        options={tagCategories}
        resetValue={{ label: '', value: '' }}
      />
    );
  }
}
TagSelector.propTypes = {
  tagCategories: PropTypes.arrayOf(PropTypes.string),
  selectedOption: PropTypes.string.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
};

export default TagSelector;

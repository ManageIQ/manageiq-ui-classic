import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class TagSelector extends React.Component {
  handleChange = (selectedOption) => {
    this.props.onTagCategoryChange({ description: selectedOption.label, id: selectedOption.value });
  }

  render() {
    const value = this.props.selectedOption.id;
    const label = this.props.selectedOption.description;
    const tagCategories = this.props.tagCategories.map(category => ({ value: category.id, label: category.description }));

    return (
      <Select
        name="form-field-name"
        value={value}
        label={label}
        onChange={this.handleChange}
        options={tagCategories}
        resetValue={{ label: '', value: '' }}
      />
    );
  }
}
TagSelector.propTypes = {
  tagCategories: PropTypes.arrayOf(PropTypes.object),
  selectedOption: PropTypes.object.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
};

export default TagSelector;

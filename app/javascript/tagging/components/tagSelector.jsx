import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class TagSelector extends React.Component {
  handleChange = (selectedOption) => {
    this.props.onTagCategoryChange({
      id: selectedOption.value,
      description: this.props.tagCategories.find(category => (category.id === selectedOption.value)).description,
    });
  }


  tagCategories = this.props.tagCategories.map(category =>
    ({ value: category.id, label: (category.description + (category.singleValue ? '*' : '')) }));

  render() {
    const label = this.props.selectedOption.description;
    const value = this.props.selectedOption.id;
    return (
      <Select
        name="form-field-name"
        value={value}
        label={label}
        onChange={this.handleChange}
        options={this.tagCategories}
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

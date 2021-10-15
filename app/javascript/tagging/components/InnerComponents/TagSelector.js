import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'carbon-components-react';
import TaggingPropTypes from '../TaggingPropTypes';

class TagSelector extends React.Component {
  // eslint-disable-next-line react/sort-comp
  handleChange = (val) => {
    const { onTagCategoryChange, tagCategories } = this.props;
    const selectedOption = val.selectedItem;
    if (selectedOption) {
      onTagCategoryChange({
        id: selectedOption.value,
        description: tagCategories.find((category) => category.id === selectedOption.value).description,
      });
    }
  };

  labelWithIcon = (description, infoText) => (
    <div>
      <span
        style={{
          display: 'inline-block',
          width: 'calc(100% - 18px)',
        }}
      >
        {description}
      </span>
      <span
        className="pull-right pficon pficon-info tag-icon"
        title={infoText}
        aria-hidden="true"
      />
      <span className="sr-only">{infoText}</span>
    </div>
  );

  // eslint-disable-next-line react/destructuring-assignment
  tagCategories = this.props.tagCategories.map((category) => ({
    keyWord: category.description.toLowerCase(),
    value: category.id,
    label: category.singleValue
      // eslint-disable-next-line react/destructuring-assignment
      ? this.labelWithIcon(category.description, this.props.infoText)
      : category.description,
  }));

  getOptions = (values) => {
    const options = [];
    values.forEach((item) => (
      options.push(
        { key: item.value, value: item.value, label: item.label }
      )
    ));
    return options;
  }

  render() {
    const { selectedOption, isDisabled } = this.props;
    let value = selectedOption.id ? { label: selectedOption.description, value: selectedOption.id } : null;
    if (value === null) {
      value = { value: -1 };
    }
    return (
      <Dropdown
        className="tag-select"
        id="tag-select"
        label={`${__('Select tag category')}`}
        disabled={isDisabled}
        onChange={(val) => this.handleChange(val)}
        items={this.getOptions(this.tagCategories)}
      />
    );
  }
}
TagSelector.propTypes = {
  tagCategories: PropTypes.arrayOf(TaggingPropTypes.category).isRequired,
  selectedOption: TaggingPropTypes.value,
  onTagCategoryChange: PropTypes.func.isRequired,
  infoText: PropTypes.string,
  isDisabled: PropTypes.bool,
};

TagSelector.defaultProps = {
  infoText: __('Only a single value can be assigned from these categories'),
  selectedOption: {},
  isDisabled: false,
};

export default TagSelector;

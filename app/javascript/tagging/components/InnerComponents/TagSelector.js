import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@carbon/react';
import TaggingPropTypes from '../TaggingPropTypes';

class TagSelector extends React.Component {
  // eslint-disable-next-line react/sort-comp
  handleChange = (val) => {
    const { onTagCategoryChange, tagCategories } = this.props;
    const selectedOption = val.selectedItem;
    if (selectedOption) {
      onTagCategoryChange({
        id: selectedOption.id,
        description: tagCategories.find((category) => category.id === selectedOption.id).description,
      });
    }
  };

  itemToElement = (item) => {
    if (!item) return null;

    if (item.singleValue) {
      const { infoText } = this.props;
      return (
        <div>
          <span
            style={{
              display: 'inline-block',
              width: 'calc(100% - 18px)',
            }}
          >
            {item.description}
          </span>
          <span
            className="pull-right pficon pficon-info tag-icon"
            title={infoText}
            aria-hidden="true"
          />
          <span className="sr-only">{infoText}</span>
        </div>
      );
    }

    return item.description;
  };

  itemToString = (item) => item?.description || '';

  render() {
    const { selectedOption, isDisabled, tagCategories } = this.props;
    const selectedItem = selectedOption.id
      ? tagCategories.find((cat) => cat.id === selectedOption.id)
      : null;

    return (
      <Dropdown
        className="tag-select"
        id="dropdown-tag-select"
        label={__('Select tag category')}
        titleText=""
        disabled={isDisabled}
        onChange={this.handleChange}
        items={tagCategories}
        itemToString={this.itemToString}
        itemToElement={this.itemToElement}
        selectedItem={selectedItem}
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

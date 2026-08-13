import PropTypes from 'prop-types';
import { Dropdown } from '@carbon/react';
import TaggingPropTypes from './tagging-prop-types';

const itemToElement = (item, infoText) => {
  if (!item) {
    return null;
  }

  if (item.singleValue) {
    return (
      <div>
        <span
          style={{
            display: 'inline-block',
            width: 'calc(100% - 18px)',
          }}
        >
          {item.label}
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

  return item.label;
};

const TagSelector = ({
  tagCategories,
  onTagCategoryChange,
  selectedOption = {},
  infoText = __('Only a single value can be assigned from these categories'),
  isDisabled = false,
}) => {
  const handleChange = (val) => {
    const selected = val.selectedItem;
    if (selected) {
      onTagCategoryChange({
        id: selected.id,
        label: tagCategories.find((category) => category.id === selected.id).label,
      });
    }
  };

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
      onChange={handleChange}
      items={tagCategories}
      itemToElement={(item) => itemToElement(item, infoText)}
      selectedItem={selectedItem}
    />
  );
};

TagSelector.propTypes = {
  tagCategories: PropTypes.arrayOf(TaggingPropTypes.category).isRequired,
  selectedOption: TaggingPropTypes.value,
  onTagCategoryChange: PropTypes.func.isRequired,
  infoText: PropTypes.string,
  isDisabled: PropTypes.bool,
};

export default TagSelector;

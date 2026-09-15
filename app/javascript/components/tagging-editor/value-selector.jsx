import PropTypes from 'prop-types';
import { Dropdown, MultiSelect } from '@carbon/react';
import TaggingPropTypes from './tagging-prop-types';

const getValues = (values) => values.map((tag) => ({ value: tag.id, label: tag.label }));

const getOptions = (values) => values.map((item) => ({ key: item.value, value: item.value, label: item.label }));

const ValueSelector = ({
  selectedTagCategory,
  values,
  onTagValueChange,
  selectedOption = [],
  multiValue = false,
  isDisabled = false,
}) => {
  const handleChange = (val) => {
    const { selectedItem, selectedItems } = val;
    const selection = selectedItem || selectedItems;

    if (selectedItems) {
      if (selectedItems.length === 0) {
        return onTagValueChange([]);
      }
      const arrayIds = selectedItems.map((item) => item.value);
      return onTagValueChange(values.filter((el) => arrayIds.includes(el.id)));
    }
    return onTagValueChange(values.filter((el) => el.id === selection.value));
  };

  const mappedValues = getValues(values);

  let label = '';
  const selectedOptions = [];

  if (selectedOption.length !== 0) {
    selectedOption.forEach((option, index) => {
      selectedOptions.push({ label: option.label, value: option.id });
      label = index === 0 ? option.label : `${label}, ${option.label}`;
    });
  } else {
    label = __('Select tag value');
  }

  if (multiValue) {
    return (
      <MultiSelect
        className="tag-select"
        id="multiselect-tag-select"
        open
        label={label}
        initialSelectedItems={selectedOptions}
        key={selectedTagCategory.label}
        items={mappedValues}
        disabled={isDisabled}
        onChange={handleChange}
      />
    );
  }

  return (
    <Dropdown
      className="tag-select"
      id="dropdown-tag-select"
      label={label}
      titleText=""
      defaultValue="placeholder"
      key={selectedOption.length === 0 ? -1 : values[0].id}
      disabled={isDisabled}
      onChange={handleChange}
      items={getOptions(mappedValues)}
    />
  );
};

ValueSelector.propTypes = {
  selectedTagCategory: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
  }).isRequired,
  selectedOption: PropTypes.arrayOf(TaggingPropTypes.value),
  values: PropTypes.arrayOf(TaggingPropTypes.value).isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  multiValue: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default ValueSelector;

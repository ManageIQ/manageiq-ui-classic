import React from 'react';
import PropTypes from 'prop-types';
import { Column, FormGroup } from 'carbon-components-react';
import TagSelector from './TagSelector';
import TaggingPropTypes from '../TaggingPropTypes';

const CategoryModifier = ({
  tagCategories,
  onTagCategoryChange,
  selectedTagCategory,
  categoryLabel,
  isDisabled,
}) => (
  <FormGroup legendText={categoryLabel}>
    <Column className="tag-modifier-form-row category-modifier">
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={onTagCategoryChange}
        selectedOption={selectedTagCategory}
        isDisabled={isDisabled}
      />
    </Column>
  </FormGroup>
);

CategoryModifier.propTypes = {
  tagCategories: PropTypes.arrayOf(TaggingPropTypes.category).isRequired,
  selectedTagCategory: TaggingPropTypes.category,
  onTagCategoryChange: PropTypes.func.isRequired,
  categoryLabel: PropTypes.string,
  isDisabled: PropTypes.bool,
};

CategoryModifier.defaultProps = {
  categoryLabel: __('Category'),
  selectedTagCategory: {},
  isDisabled: false,
};

export default CategoryModifier;

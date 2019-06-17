import React from 'react';
import PropTypes from 'prop-types';
import { Col, ControlLabel, FormGroup } from 'patternfly-react';
import { __ } from '../../../global-functions';
import TagSelector from './TagSelector';
import TaggingPropTypes from '../TaggingPropTypes';

const CategoryModifier = ({
  tagCategories,
  onTagCategoryChange,
  selectedTagCategory,
  categoryLabel,
}) => (
  <FormGroup>
    <Col xs={12} md={4} lg={4}>
      <ControlLabel>{categoryLabel}</ControlLabel>
    </Col>
    <Col xs={12} md={8} lg={8}>
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={onTagCategoryChange}
        selectedOption={selectedTagCategory}
      />
    </Col>
  </FormGroup>
);

CategoryModifier.propTypes = {
  tagCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  selectedTagCategory: TaggingPropTypes.category,
  onTagCategoryChange: PropTypes.func.isRequired,
  categoryLabel: PropTypes.string,
};

CategoryModifier.defaultProps = {
  categoryLabel: __('Category'),
  selectedTagCategory: {},
};

export default CategoryModifier;

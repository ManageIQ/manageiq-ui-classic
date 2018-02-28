import React from 'react';
import PropTypes from 'prop-types';
import TagSelector from './tagSelector';
import ValueSelector from './valueSelector';

const TagModifier = ({
  tags, selectedTagCategory, selectedTagValue, onTagCategoryChange, onTagValueChange,
}) => {
  const tagValues = tags[selectedTagCategory] || [];
  const tagCategories = Object.keys(tags) || [];
  return (
    <div className="col-lg-6">
      <div className="row">
        <div className="col-lg-12">
          <h1>Add/modify tag</h1>
        </div>
        <div className="col-lg-6">
          <h2>Category:</h2>
        </div>
        <div className="col-lg-6">
          <TagSelector tagCategories={tagCategories} onTagCategoryChange={onTagCategoryChange} selectedOption={selectedTagCategory} />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6">
          <h2>Assigned Value:</h2>
        </div>
        <div className="col-lg-6">
          <ValueSelector tagValues={tagValues} onTagValueChange={onTagValueChange} selectedOption={selectedTagValue} />
        </div>
      </div>
    </div>
  );
};

TagModifier.propTypes = {
  tags: PropTypes.object,
  selectedTagCategory: PropTypes.string.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  selectedTagValue: PropTypes.string.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
};

export default TagModifier;

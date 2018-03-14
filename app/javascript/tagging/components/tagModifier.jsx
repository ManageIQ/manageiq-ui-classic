import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'patternfly-react';
import TagSelector from './tagSelector';
import ValueSelector from './valueSelector';

const TagModifier = ({
  tags, selectedTagCategory, selectedTagValue, onTagCategoryChange, onTagValueChange, header, categoryLabel, valueLabel, multiValue,
}) => {

  console.log('MODIFIER:', tags );
  const tagValues = (tags.find(tag => (tag.id == selectedTagCategory.id)) && tags.find(tag => (tag.id == selectedTagCategory.id)).values) || [];
  const tagCategories = tags.map(tag => ({description: tag.description, id: tag.id})) || [];
  return (
    <React.Fragment>
      <Row><Col lg={12}><h1>{header}</h1></Col></Row>
      <Row>
        <Col xs={12} md={4} lg={6}><h2>{categoryLabel}</h2></Col>
        <Col xs={12} md={8} lg={6}>
          <TagSelector tagCategories={tagCategories} onTagCategoryChange={onTagCategoryChange} selectedOption={selectedTagCategory} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={4} lg={6}><h2>{valueLabel}</h2></Col>
        <Col xs={12} md={8} lg={6}>
          <ValueSelector tagValues={tagValues} onTagValueChange={onTagValueChange} selectedOption={selectedTagValue} multiValue={multiValue} />
        </Col>
      </Row>
    </React.Fragment>
  );
};

TagModifier.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object),
  selectedTagCategory: PropTypes.object.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  selectedTagValue: PropTypes.object.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  header: PropTypes.string,
  categoryLabel: PropTypes.string,
  valueLabel: PropTypes.string,
  multiValue: PropTypes.bool.isRequired,
};

TagModifier.defaultProps = {
  header: 'Add/Modify tag',
  categoryLabel: 'Category:',
  valueLabel: 'Assigned Value:',
  multiValue: false,
};

export default TagModifier;

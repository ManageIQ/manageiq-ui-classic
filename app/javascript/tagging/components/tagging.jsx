import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'patternfly-react';
import TagModifier from './tagModifier';
import TagView from './tagView';

class Tagging extends React.Component {
  onTagCategoryChange = (selectedTagCategory) => {
    this.props.onTagCategoryChange(selectedTagCategory);
  }

  onTagValueChange = (selectedTagValue) => {
    if (this.props.tags.find(tag => (tag.id === this.props.selectedTagCategory.id)).singleValue) {
      this.props.onTagValueChange({ tagCategory: this.props.selectedTagCategory, tagValue: selectedTagValue });
    } else {
      this.props.onTagMultiValueChange({ tagCategory: this.props.selectedTagCategory, tagValue: selectedTagValue });
    }
  }

  onTagDeleteClick = (tagCategory, tagValue) => {
    this.props.onTagDeleteClick({ tagCategory, tagValue });
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col xs={12} md={8} lg={6}>
            <TagModifier
              tags={this.props.tags}
              onTagValueChange={this.onTagValueChange}
              onTagCategoryChange={this.onTagCategoryChange}
              selectedTagCategory={this.props.selectedTagCategory}
              selectedTagValue={this.props.selectedTagValue}
              multiValue={(this.props.tags.find(tag => (tag.id === this.props.selectedTagCategory.id)) &&
                this.props.tags.find(tag => (tag.id === this.props.selectedTagCategory.id)).singleValue) == true}
            />
          </Col>
          <Col xs={12} md={4} lg={6}>
            <TagView assignedTags={this.props.assignedTags} onTagDeleteClick={this.onTagDeleteClick} />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <div>{this.props.infoText}</div>
          </Col>
        </Row>
      </Grid>
    );
  }
}

Tagging.propTypes = {
  selectedTagCategory: PropTypes.object.isRequired,
  selectedTagValue: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(PropTypes.object),
  assignedTags: PropTypes.arrayOf(PropTypes.object),
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  onTagMultiValueChange: PropTypes.func,
  infoText: PropTypes.string,
};

Tagging.defaultProps = {
  onTagMultiValueChange: () => {},
  infoText: '* Only a single value can be assigned from these categories',
};

export default Tagging;

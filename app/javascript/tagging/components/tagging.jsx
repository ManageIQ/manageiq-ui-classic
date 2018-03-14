import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, ButtonGroup, Button } from 'patternfly-react';
import TagModifier from './tagModifier';
import TagView from './tagView';

class Tagging extends React.Component {
  onTagCategoryChange = (selectedTagCategory) => {
    this.props.onTagCategoryChange(selectedTagCategory);
  }

  onTagValueChange = (selectedTagValue) => {
    if (this.props.multiValue) {
      this.props.onTagMultiValueChange({ tagCategory: this.props.selectedTagCategory, tagValue: selectedTagValue })
    }
    else {
      this.props.onTagValueChange({ tagCategory: this.props.selectedTagCategory, tagValue: selectedTagValue })
    }
  }

  onTagDeleteClick = (tagCategory, tagValue) => {
    this.props.onTagDeleteClick({ tagCategory, tagValue });
  }

  render() {
    console.log('TAGGING', this.props);
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
              multiValue={this.props.multiValue}
            />
          </Col>
          <Col xs={12} md={4} lg={6}>
            <TagView assignedTags={this.props.assignedTags} onTagDeleteClick={this.onTagDeleteClick} />
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
  showButtons: PropTypes.bool.isRequired,
  hideReset: PropTypes.bool.isRequired,
  multiValue: PropTypes.bool.isRequired,
};

Tagging.defaultProps = {
  showButtons: true,
  hideReset: false,
  multiValue: false,
};

export default Tagging;

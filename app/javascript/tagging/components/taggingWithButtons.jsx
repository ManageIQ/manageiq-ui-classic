import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, ButtonGroup, Button } from 'patternfly-react';
import Tagging from './tagging'

class TaggingWithButtons extends React.Component {
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
    console.log('TAGGING WITH BUTTONS', this.props);
    return (
      <Grid>
      <Tagging
        tags={this.props.tags}
        assignedTags={this.props.assignedTags}
        onTagValueChange={this.props.onTagValueChange}
        onTagMultiValueChange={this.props.onTagMultiValueChange}
        onTagCategoryChange={this.props.onTagCategoryChange}
        onTagDeleteClick={this.props.onTagDeleteClick}
        selectedTagCategory={this.props.selectedTagCategory}
        selectedTagValue={this.props.selectedTagValue}
        multiValue={this.props.multiValue}
      />
        <Row>
          <ButtonGroup>
            <Button onClick={this.props.cancelButton.onCLick} href={this.props.cancelButton.href} disabled={this.props.cancelButton.disabled} type={this.props.cancelButton.type}>
              {this.props.cancelButton.description}
            </Button>
            {this.props.hideReset && <Button onClick={this.props.resetButton.onCLick} href={this.props.resetButton.href} disabled={this.props.resetButton.disabled} type={this.props.resetButton.type}>
              {this.props.resetButton.description}
            </Button>}
            <Button onClick={this.props.saveButton.onCLick} href={this.props.saveButton.href} disabled={this.props.saveButton.disabled} type={this.props.saveButton.type}>
              {this.props.saveButton.description}
            </Button>
          </ButtonGroup>
        </Row>

      </Grid>
    );
  }
}

TaggingWithButtons.propTypes = {
  selectedTagCategory: PropTypes.object.isRequired,
  selectedTagValue: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(PropTypes.object),
  assignedTags: PropTypes.arrayOf(PropTypes.object),
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  hideReset: PropTypes.bool.isRequired,
  cancelButton: PropTypes.object,
  resetButton: PropTypes.object,
  saveButton: PropTypes.object,
  multiValue: PropTypes.bool.isRequired,
};

TaggingWithButtons.defaultProps = {
  cancelButton: { onCLick: () => {}, href: '', type: 'button', disabled: false, description: 'Cancel' },
  resetButton: { onCLick: () => {}, href: '', type: 'reset', disabled: false, description: 'Reset' },
  saveButton: { onCLick: () => {}, href: '', type: 'submit', disabled: true, description: 'Save' },
  hideReset: false,
  multiValue: false,
};

export default TaggingWithButtons;

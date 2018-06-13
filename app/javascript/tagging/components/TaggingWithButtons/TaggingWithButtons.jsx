import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, ButtonGroup, Button } from 'patternfly-react';
import { ButtonToolbar } from 'react-bootstrap';
import Tagging from '../Tagging/Tagging';

class TaggingWithButtons extends React.Component {
  onTagCategoryChange = selectedTagCategory => this.props.onTagCategoryChange(selectedTagCategory);

  onTagDeleteClick = (tagCategory, tagValue) => this.props.onTagDeleteClick({ tagCategory, tagValue });

  render() {
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
        />
        <Row className="pull-right">
          <ButtonToolbar>
            <ButtonGroup>
              <Button
                onClick={() => this.props.saveButton.onClick(this.props.assignedTags)}
                href={this.props.saveButton.href}
                disabled={this.props.saveButton.disabled}
                type={this.props.saveButton.type}
              >
                {this.props.saveButton.description}
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              {this.props.showReset &&
                <Button
                  onClick={this.props.resetButton.onClick}
                  href={this.props.resetButton.href}
                  disabled={this.props.resetButton.disabled}
                  type={this.props.resetButton.type}
                >
                  {this.props.resetButton.description}
                </Button>}
            </ButtonGroup>
            <ButtonGroup>
              <Button
                onClick={this.props.cancelButton.onClick}
                href={this.props.cancelButton.href}
                disabled={this.props.cancelButton.disabled}
                type={this.props.cancelButton.type}
              >
                {this.props.cancelButton.description}
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
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
  onTagMultiValueChange: PropTypes.func,
  showReset: PropTypes.bool,
  cancelButton: PropTypes.object,
  resetButton: PropTypes.object,
  saveButton: PropTypes.object,
};

TaggingWithButtons.defaultProps = {
  cancelButton: {
    onClick: () => {}, href: '', type: 'button', disabled: false, description: 'Cancel',
  },
  resetButton: {
    onClick: () => {}, href: '', type: 'reset', disabled: false, description: 'Reset',
  },
  saveButton: {
    onClick: () => {}, href: '', type: 'submit', disabled: false, description: 'Save',
  },
  showReset: true,
  onTagMultiValueChange: () => {},
};

export default TaggingWithButtons;

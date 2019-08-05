import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, ButtonGroup, Button } from 'patternfly-react';
import Tagging from '../Tagging/Tagging';
import TaggingPropTypes from '../TaggingPropTypes';

class TaggingWithButtons extends React.Component {
  onTagCategoryChange = selectedTagCategory => this.props.onTagCategoryChange(selectedTagCategory);

  onTagDeleteClick = (tagCategory, tagValue) => this.props.onTagDeleteClick({ tagCategory, tagValue });

  render() {
    return (
      <Grid fluid>
        <Tagging
          tags={this.props.tags}
          assignedTags={this.props.assignedTags}
          onTagValueChange={this.props.onTagValueChange}
          onSingleTagValueChange={this.props.onSingleTagValueChange}
          onTagMultiValueChange={this.props.onTagMultiValueChange}
          onTagCategoryChange={this.props.onTagCategoryChange}
          onTagDeleteClick={this.props.onTagDeleteClick}
          selectedTagCategory={this.props.selectedTagCategory}
          selectedTagValue={this.props.selectedTagValue}
          options={this.props.options}
        />
        <Row className="pull-right">
          <div role="toolbar" className="btn-toolbar">
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
          </div>
        </Row>
      </Grid>
    );
  }
}

TaggingWithButtons.propTypes = {
  selectedTagCategory: TaggingPropTypes.category,
  selectedTagValue: TaggingPropTypes.value,
  tags: TaggingPropTypes.tags,
  assignedTags: TaggingPropTypes.tags,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  onSingleTagValueChange: PropTypes.func,
  onTagMultiValueChange: PropTypes.func,
  showReset: PropTypes.bool,
  cancelButton: TaggingPropTypes.button,
  resetButton: TaggingPropTypes.button,
  saveButton: TaggingPropTypes.button,
  options: PropTypes.shape({
    onlySingleTag: PropTypes.bool,
    hideHeaders: PropTypes.bool,
  }),
};

TaggingWithButtons.defaultProps = {
  showReset: true,
  onSingleTagValueChange: () => {},
  onTagMultiValueChange: () => {},
};

export default TaggingWithButtons;

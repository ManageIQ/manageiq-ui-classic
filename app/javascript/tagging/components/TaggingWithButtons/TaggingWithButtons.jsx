import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Row, ButtonSet, Button,
} from 'carbon-components-react';
import Tagging from '../Tagging/Tagging';
import TaggingPropTypes from '../TaggingPropTypes';

class TaggingWithButtons extends React.Component {
  onTagCategoryChange = (selectedTagCategory) => {
    const { onTagCategoryChange } = this.props;
    onTagCategoryChange(selectedTagCategory);
  };

  onTagDeleteClick = (tagCategory, tagValue) => {
    const { onTagDeleteClick } = this.props;
    onTagDeleteClick({ tagCategory, tagValue });
  };

  render() {
    const {
      selectedTagCategory, tags, assignedTags,
      onTagDeleteClick, onTagCategoryChange,
      onTagValueChange, onSingleTagValueChange, showReset,
      options, saveButton, resetButton, cancelButton,
    } = this.props;
    return (
      <Grid>
        <Tagging
          selectedTagCategory={selectedTagCategory}
          tags={tags}
          assignedTags={assignedTags}
          onTagDeleteClick={onTagDeleteClick}
          onTagCategoryChange={onTagCategoryChange}
          onTagValueChange={onTagValueChange}
          onSingleTagValueChange={onSingleTagValueChange}
          options={options}
        />
        <Row className="pull-right">
          <div role="toolbar" className="btn-toolbar">
            <ButtonSet>
              <Button
                onClick={() => saveButton.onClick(assignedTags)}
                disabled={saveButton.disabled}
                type={saveButton.type}
              >
                {saveButton.description}
              </Button>
              {showReset
                && (
                  <Button
                    onClick={resetButton.onClick}
                    disabled={resetButton.disabled}
                    type={resetButton.type}
                  >
                    {resetButton.description}
                  </Button>
                )}
              <Button
                onClick={cancelButton.onClick}
                disabled={cancelButton.disabled}
                type={cancelButton.type}
                kind="secondary"
              >
                {cancelButton.description}
              </Button>
            </ButtonSet>
          </div>
        </Row>
      </Grid>
    );
  }
}

TaggingWithButtons.propTypes = {
  selectedTagCategory: TaggingPropTypes.category,
  tags: TaggingPropTypes.tags,
  assignedTags: TaggingPropTypes.tags,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  onSingleTagValueChange: PropTypes.func,
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
  selectedTagCategory: {},
  tags: [],
  assignedTags: [],
  cancelButton: {},
  resetButton: {},
  saveButton: {},
  options: {
    onlySingleTag: false,
    hideHeaders: false,
  },
};

export default TaggingWithButtons;

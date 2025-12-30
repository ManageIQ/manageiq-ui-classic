import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Column, ButtonSet, Button,
} from '@carbon/react';
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
      <Grid className="tagging-container">
        <Column sm={4} md={8} lg={16} className="add-or-assign-tags-section-grid-column">
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
        </Column>
        <Column sm={4} md={8} lg={16} className="buttons-section-grid-column">
          <div className="tagging-row-wrapper tagging-toolbar pull-right">
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
          </div>
        </Column>
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

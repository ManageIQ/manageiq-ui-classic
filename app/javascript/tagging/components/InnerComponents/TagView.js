/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';
import TagCategory from './TagCategory';
import TaggingPropTypes from '../TaggingPropTypes';
import NotificationMessage from '../../../components/notification-message';

class TagView extends React.Component {
  generateTagCategories = (tag) => (
    <li key={tag.id}>
      <TagCategory
        key={tag.id}
        tagCategory={{ id: tag.id, description: tag.description }}
        values={tag.values}
        onTagDeleteClick={this.props.onTagDeleteClick}
        showCloseButton={this.props.showCloseButton}
      />
    </li>
  );

  render() {
    const { hideHeader, header } = this.props;
    const assignedTags = [...this.props.assignedTags];
    const view = (assignedTags.length > 0
      ? <ul className="list-inline">{ assignedTags.sort((a, b) => (a.description < b.description ? -1 : 1)).map(this.generateTagCategories) }</ul>
      : <NotificationMessage type="info" message={__('No Assigned Tags')} />
    );
    return (
      <div id="assignments_div">
        { !hideHeader
          && (
            <Grid className="tag-modifier-header">
              <Column sm={4} md={8} lg={16}>
                <h4>{header}</h4>
              </Column>
            </Grid>
          )}
        <Grid className="tag-modifier-form assigned-tags" condensed>
          <Column sm={4} md={8} lg={16}>
            { view }
          </Column>
        </Grid>
      </div>
    );
  }
}
TagView.propTypes = {
  assignedTags: TaggingPropTypes.tags,
  onTagDeleteClick: PropTypes.func.isRequired,
  header: PropTypes.string,
  hideHeader: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};

TagView.defaultProps = {
  assignedTags: [],
  header: __('Assigned tags'),
  hideHeader: false,
  showCloseButton: true,
};

export default TagView;

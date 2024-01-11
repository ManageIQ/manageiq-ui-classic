/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Column } from 'carbon-components-react';
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
            <Row className="tag-modifier-header">
              <Column lg={12}>
                <h4>{header}</h4>
              </Column>
            </Row>
          )}
        <Row className="tag-modifier-form assigned-tags">
          { view }
        </Row>
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

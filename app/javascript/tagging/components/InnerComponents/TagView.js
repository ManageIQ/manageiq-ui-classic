import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'patternfly-react';
import TagCategory from './TagCategory';
import { __ } from '../../../global-functions';
import TaggingPropTypes from '../TaggingPropTypes';

class TagView extends React.Component {
  generateTagCategories = tag => (
    <li key={tag.id}>
      <TagCategory
        key={tag.id}
        tagCategory={{ id: tag.id, description: tag.description }}
        values={tag.values}
        onTagDeleteClick={this.props.onTagDeleteClick}
      />
    </li>
  );

  render() {
    const assignedTags = [...this.props.assignedTags];
    return (
      <div id="assignments_div">
        { !this.props.hideHeader &&
          <Row>
            <Col lg={12}>
              <h2>{this.props.header}</h2>
            </Col>
          </Row>}
        <Row>
          <Col lg={12}>
            <ul className="list-inline">
              {assignedTags
                .sort((a, b) => (a.description < b.description ? -1 : 1))
                .map(this.generateTagCategories)}
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}
TagView.propTypes = {
  assignedTags: TaggingPropTypes.tags,
  onTagDeleteClick: PropTypes.func,
  header: PropTypes.string,
  hideHeader: PropTypes.bool,
};

TagView.defaultProps = {
  header: __('Assigned tags'),
  hideHeader: false,
};

export default TagView;

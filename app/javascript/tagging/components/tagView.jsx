import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'patternfly-react';
import TagCategory from './tagCategory';

class TagView extends React.Component {
  generateTagCategories = tag =>
    (<TagCategory
      key={`${tag.tagCategory.id}`}
      tagCategory={tag.tagCategory}
      tagValues={tag.tagValues}
      onTagDeleteClick={this.props.onTagDeleteClick}
    />);

  render() {
    console.log('TAG VIEW', this.props);
    return (
      <React.Fragment>
        <Row><Col lg={12}><h1>{this.props.header}</h1></Col></Row>
        <Row>
          <ul className="list">
            {this.props.assignedTags.map(this.generateTagCategories)}
          </ul>
        </Row>
      </React.Fragment>
    );
  }
}

TagView.propTypes = {
  assignedTags: PropTypes.arrayOf(PropTypes.object),
  onTagDeleteClick: PropTypes.func.isRequired,
  header: PropTypes.string,
};

TagView.defaultProps = {
  header: 'Assigned tags',
};

export default TagView;

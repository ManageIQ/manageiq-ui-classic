import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'patternfly-react';
import Tag from './tag';

class TagCategory extends React.Component {
  generateTag = tagValue =>
    (<Tag
      key={`${tagValue.id}`}
      tagCategory={this.props.tagCategory}
      tagValue={tagValue}
      onTagDeleteClick={this.props.onTagDeleteClick}
    />);

  render() {
    console.log('TAG CATEGORY', this.props);
    return (
      <React.Fragment>
        <Row><Col lg={12}><h1>{this.props.header}</h1></Col></Row>
        <Row>
          <ul className="list-inline">
            {this.props.tagCategory.description}: {this.props.tagValues.map(this.generateTag)}
          </ul>
        </Row>
      </React.Fragment>
    );
  }
}

TagCategory.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: PropTypes.object.isRequired,
  tagValues: PropTypes.arrayOf(PropTypes.object).isRequired,
};



export default TagCategory;

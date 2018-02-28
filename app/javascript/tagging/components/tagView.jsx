import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'patternfly-react';
import Tag from './tag';

class TagView extends React.Component {
  generateTag = tag =>
    (<Tag
      key={`${tag.tagCategory}: ${tag.tagValue}`}
      tagCategory={tag.tagCategory}
      tagValue={tag.tagValue}
      onTagDeleteClick={this.props.onTagDeleteClick}
    />);

  render() {
    return (
      <React.Fragment>
        <Row><Col lg={12}><h1>{this.props.header}</h1></Col></Row>
        <Row>
          <ul className="list-inline">
            {this.props.setTags.map(this.generateTag)}
          </ul>
        </Row>
      </React.Fragment>
    );
  }
}

TagView.propTypes = {
  setTags: PropTypes.arrayOf(PropTypes.object),
  onTagDeleteClick: PropTypes.func.isRequired,
  header: PropTypes.string,
};

TagView.defaultProps = {
  header: 'Set tags',
};

export default TagView;

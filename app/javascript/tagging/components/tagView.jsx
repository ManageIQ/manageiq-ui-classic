import React from 'react';
import PropTypes from 'prop-types';
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
      <ul className="list-inline">
        {this.props.setTags.map(this.generateTag)}
      </ul>
    );
  }
}

TagView.propTypes = {
  setTags: PropTypes.arrayOf(PropTypes.object),
  onTagDeleteClick: PropTypes.func.isRequired,
};

export default TagView;

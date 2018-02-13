import * as React from 'react';
import PropTypes from 'prop-types';
import './tag.scss';

class Tag extends React.Component {
  handleClick = () => this.props.onTagDeleteClick(this.props.tagCategory, this.props.tagValue);

  render() {
    return (
      <li key={`${this.props.tagCategory}: ${this.props.tagValue}`}>
        <span className="label label-info">
          {this.props.tagCategory}: {this.props.tagValue}
          <a href="#" onClick={(e) => { e.preventDefault(); this.handleClick(); }} className="remove-button">
            <span className="pficon pficon-close" aria-hidden="true" />
            <span className="sr-only">Remove</span>
          </a>
        </span>
      </li>
    );
  }
}

Tag.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: PropTypes.string.isRequired,
  tagValue: PropTypes.string.isRequired,
};

export default Tag;

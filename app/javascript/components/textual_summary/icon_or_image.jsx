import * as React from 'react';
import PropTypes from 'prop-types';

/**
 * Render icon or an image with a title
 */
export default class IconOrImage extends React.Component {
  renderIcon = () => {
    if (this.props.background) {
      return (
        <div style={{ background: this.props.background }} className="backgrounded-icon">
          <i className={this.props.icon} title={this.props.title} />
        </div>
      );
    }

    return <i className={this.props.icon} title={this.props.title} />;
  };

  // FIXME: preprocess and test in-lined images
  renderImage = () => <img src={this.props.image} alt={this.props.title} title={this.props.title} />;

  render() {
    if (!this.props.image) {
      return this.props.icon ? this.renderIcon() : '';
    }
    return this.renderImage();
  }
}

IconOrImage.propTypes = {
  title: PropTypes.string,
  image: PropTypes.string,
  icon: PropTypes.string,
  background: PropTypes.string,
};

IconOrImage.defaultProps = {
  title: null,
  image: null,
  icon: null,
};

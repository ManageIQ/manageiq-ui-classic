import * as React from 'react';
import PropTypes from 'prop-types';

/**
 * Render icon or an image with a title
 */
export default class IconOrImage extends React.Component {
  renderIcon = () => {
    const { background, icon, title } = this.props;

    if (background) {
      return (
        <div style={{ background }} className="backgrounded-icon">
          <i className={icon} title={title} />
        </div>
      );
    }

    return <i className={icon} title={title} />;
  };

  // FIXME: preprocess and test in-lined images
  // eslint-disable-next-line react/destructuring-assignment
  renderImage = () => <img src={this.props.image} alt={this.props.title} title={this.props.title} />;

  render() {
    const { image, icon } = this.props;
    if (!image) {
      return icon ? this.renderIcon() : '';
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
  background: null,
};

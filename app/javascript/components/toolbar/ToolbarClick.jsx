import PropTypes from 'prop-types';

import { adjustColor } from './utility';

const iconStyle = ({ color, enabled, text }) => (
  text
    ? { color: adjustColor(color, enabled), marginRight: '5px' }
    : { color: adjustColor(color, enabled) }
);

export const ToolbarClick = ({ title = null, text = null, id = null, hidden = null, img_url = null, icon = null, ...props }) => (
  <span
    tabIndex={0}
    role="button"
    title={title}
    style={hidden ? { display: 'none !important' } : {}}
    name={id}
    id={id}
  >
    { icon && <i className={icon} style={iconStyle({ color: props.color, enabled: props.enabled, text })} /> }
    { img_url && !icon
      && (
        <img
          alt={title}
          src={img_url}
        />
      )}
    <span>{text}</span>
  </span>
);

ToolbarClick.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  id: PropTypes.string,
  hidden: PropTypes.bool,
  img_url: PropTypes.string,
  icon: PropTypes.string,
};

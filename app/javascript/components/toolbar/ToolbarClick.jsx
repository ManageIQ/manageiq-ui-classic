/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';

import { adjustColor } from './utility';

const iconStyle = ({ color, enabled, text }) => (
  text
    ? { color: adjustColor(color, enabled), marginRight: '5px' }
    : { color: adjustColor(color, enabled) }
);

export const ToolbarClick = (props) => (
  <span
    tabIndex={0}
    role="button"
    title={props.title}
    style={props.hidden ? { display: 'none !important' } : {}}
    name={props.id}
    id={props.id}
  >
    { props.icon && <i className={props.icon} style={iconStyle(props)} /> }
    { props.img_url && !props.icon
      && (
        <img
          alt={props.title}
          src={props.img_url}
        />
      )}
    <span>{props.text}</span>
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

ToolbarClick.defaultProps = {
  title: null,
  text: null,
  id: null,
  hidden: null,
  img_url: null,
  icon: null,
};

import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { adjustColor, isEnabled } from './utility';
import CountContext from './ToolbarContext';

const classNames = require('classnames');

const ButtonIcon = ({
  img_url: imgUrl, icon, color, enabled,
}) => {
  if (icon) {
    return <i className={icon} style={{ color: adjustColor(color, enabled) }} />;
  }

  if (imgUrl && !icon) {
    return <img alt="Button icon" src={imgUrl} />;
  }

  return null;
};

ButtonIcon.propTypes = {
  img_url: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
};

ButtonIcon.defaultProps = {
  img_url: null,
  icon: null,
  color: null,
};

export const ToolbarButton = (props) => {
  const count = useContext(CountContext);
  const {
    onwhen, enabled, id, name, title, text, selected,
  } = props;
  const disabled = !(onwhen ? isEnabled(onwhen, count) : enabled);

  return (
    <button
      type="button"
      id={id}
      name={name}
      title={title}
      disabled={disabled}
      className={classNames('btn btn-default toolbar-button', { active: selected, disabled })}
      onClick={() => props.onClick(props)}
    >
      { ButtonIcon(props) }
      { text }
    </button>
  );
};

ToolbarButton.propTypes = {
  title: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  text: PropTypes.string,
  selected: PropTypes.bool,
  enabled: PropTypes.bool.isRequired,
  onwhen: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

ToolbarButton.defaultProps = {
  title: null,
  id: null,
  name: null,
  text: null,
  onwhen: null,
  selected: null,
};

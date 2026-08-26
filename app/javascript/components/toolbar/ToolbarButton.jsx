import { useContext } from 'react';
import PropTypes from 'prop-types';

import { adjustColor, isEnabled } from './utility';
import CountContext from './ToolbarContext';
import { carbonizeIcon } from '../../menu/icon';

const classNames = require('classnames');

const ButtonIcon = ({
  img_url: imgUrl = null,
  icon = null,
  color = null,
  enabled,
}) => {
  if (icon) {
    const IconColor = adjustColor(color, enabled);
    const IconElement = carbonizeIcon(icon, { className: 'carbon-icon' });
    return <IconElement color={IconColor} />;
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

export const ToolbarButton = (props) => {
  const count = useContext(CountContext);
  const {
    onwhen = null,
    enabled,
    id = null,
    name = null,
    title = null,
    text = null,
    selected = null,
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

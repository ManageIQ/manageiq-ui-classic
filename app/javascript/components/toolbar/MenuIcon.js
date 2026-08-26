import PropTypes from 'prop-types';
import { carbonizeIcon } from '../../menu/icon';

export const MenuIcon = ({ icon = null, color = null, text = null }) => {
  const IconElement = icon ? carbonizeIcon(icon, { className: 'carbon-icon' }) : null;

  return (
    <div className="miq-toolbar-option-text-with-icon">
      {IconElement && <IconElement color={color} />}
      <span>{ text }</span>
    </div>
  );
};

MenuIcon.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
};

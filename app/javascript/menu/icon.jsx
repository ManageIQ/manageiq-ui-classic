import PropTypes from 'prop-types';
import * as icons from '@carbon/react/icons';

export const carbonizeIcon = (classname, options = undefined) => {
  const size = (options?.size) || 20; // Default size is 24px

  if (!classname) {
    return null;
  }

  if (!classname.startsWith('carbon--')) {
    return (props) => <i className={classname} {...props} />;
  }

  const name = classname.replace(/^carbon--/, '');
  const IconComponent = icons[name];
  if (options?.className) {
    return (props) => (
      <div className={`${options.className}-div`}>
        <IconComponent className={options.className} size={size} {...props} />
      </div>
    );
  }
  return (props) => (
    <IconComponent size={size} {...props} />
  );
};

const MiqIcon = ({
  icon,
  size = 16,
}) => {
  const IconElement = carbonizeIcon(icon, { size });
  return <IconElement style={{ marginBottom: '-4px' }} />;
};

MiqIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export default MiqIcon;

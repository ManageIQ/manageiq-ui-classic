import PropTypes from 'prop-types';

export const menuProps = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  iconClass: PropTypes.string,
  href: PropTypes.string.isRequired,
  preventHref: PropTypes.bool,
  visible: PropTypes.bool,
  active: PropTypes.bool,
};

export const RecursiveMenuProps = () => ({
  ...menuProps,
  items: PropTypes.arrayOf(PropTypes.shape(menuProps)),
});

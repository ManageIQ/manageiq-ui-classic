import PropTypes from 'prop-types';

export const menuProps = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  href: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  active: PropTypes.bool,
};

export const RecursiveMenuProps = () => ({
  ...menuProps,
  items: PropTypes.arrayOf(PropTypes.shape(menuProps)),
});

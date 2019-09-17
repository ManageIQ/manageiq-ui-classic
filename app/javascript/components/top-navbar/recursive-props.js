import PropTypes from 'prop-types';

export const helpMenuProps = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  link_params: PropTypes.shape({
    href: PropTypes.string.isRequired,
  }),
};

export const recursiveHelpMenuProps = {
  ...helpMenuProps,
  items: PropTypes.arrayOf(
    PropTypes.shape(
      {
        ...helpMenuProps,
      },
    ),
  ),
};

export const userMenuProps = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  href: PropTypes.string,
};

export const recursiveUserMenuProps = {
  ...userMenuProps,
  items: PropTypes.arrayOf(
    PropTypes.shape(
      {
        ...helpMenuProps,
      },
    ),
  ),
};

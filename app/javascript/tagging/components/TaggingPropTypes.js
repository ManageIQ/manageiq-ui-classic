import PropTypes from 'prop-types';

const TaggingPropTypes = {
  category: PropTypes.shape({
    id: PropTypes.number,
    description: PropTypes.string,
  }).isRequired,
  value: PropTypes.shape({
    id: PropTypes.number,
    description: PropTypes.string,
  }).isRequired,
  tags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired).isRequired,
  })).isRequired,
};

export default TaggingPropTypes;

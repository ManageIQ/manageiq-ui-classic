import PropTypes from 'prop-types';

const RequiredLabel = ({ label }) => (
  <>
    <span style={{ color: '#ff0000' }}>* </span>
    { label }
  </>
);

RequiredLabel.propTypes = {
  label: PropTypes.string.isRequired,
};

export default RequiredLabel;

import React from 'react';
import PropTypes from 'prop-types';

/** Component to render an image in MiqStructuredList row's value section. */
const CellImage = ({ row }) => (
  <div className="cell image" title={row.title}>
    <img src={row.image} alt={row.image} title={row.title} />
  </div>
);

export default CellImage;

CellImage.propTypes = {
  row: PropTypes.shape({
    image: PropTypes.string.isRequired,
    title: PropTypes.string,
  }),
};

CellImage.defaultProps = {
  row: PropTypes.shape({
    title: undefined,
  }),
};

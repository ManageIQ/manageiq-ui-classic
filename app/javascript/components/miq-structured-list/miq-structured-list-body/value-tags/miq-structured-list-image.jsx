import React from 'react';
import PropTypes from 'prop-types';

/** Component to render an image in the cell.  */
const MiqStructuredListImage = ({ row }) => (
  <div className="cell image" title={row.title}>
    <img src={row.image} alt={row.image} title={row.title} />
  </div>
);

export default MiqStructuredListImage;

MiqStructuredListImage.propTypes = {
  row: PropTypes.shape({
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';

const ModalItem = ({
  label, value,
}) => (
  <p className="ModalItem">
    <strong>
      {`${label}`}
    </strong>
  &emsp;
    {value}
  </p>
);

export default ModalItem;

ModalItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

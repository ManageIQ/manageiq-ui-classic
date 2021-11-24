import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
} from 'carbon-components-react';

const MiqStructuredList = ({ type, headers, rows }) => {
  const renderHeaderItem = (header, index) => {
    <StructuredListCell head key={index}>
      {header}
    </StructuredListCell>;
  };
  const renderHeader = () => (
    <StructuredListHead>
      <StructuredListRow head tabIndex={0}>
        {
          headers.map((header, index) => renderHeaderItem(header, index))
        }

      </StructuredListRow>
    </StructuredListHead>
  );

  const renderRow = (row, index) => (
    <StructuredListRow tabIndex={index} key={index}>
      <StructuredListCell className="label_header">
        {row.label}
      </StructuredListCell>
      <StructuredListCell>
        {row.text}
      </StructuredListCell>
    </StructuredListRow>
  );

  return (
    <StructuredListWrapper ariaLabel="Structured list" className={classNames('miq-structured-list', type)}>
      {
        headers && headers.length > 0 && renderHeader()
      }
      <StructuredListBody>
        {
          rows.map((row, index) => renderRow(row, index))
        }
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

export default MiqStructuredList;

MiqStructuredList.propTypes = {
  type: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.any),
  rows: PropTypes.arrayOf(PropTypes.any).isRequired,
};

MiqStructuredList.defaultProps = {
  headers: [],
};

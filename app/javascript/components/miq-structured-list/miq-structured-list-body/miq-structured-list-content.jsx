/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import MiqStructuredListIcon from './value-tags/miq-structured-list-icon';
import MiqStructuredListImage from './value-tags/miq-structured-list-image';
import MiqStructuredListButton from './value-tags/miq-structured-list-button';
import MiqStructuredListText from './value-tags/miq-structured-list-text';
import { isArray } from '../helpers';
import MiqStructuredListMultiRow from './value-types/miq-structured-list-multi-row';

/** Component to render the values of a cell.  */
const MiqStructuredListContent = ({ row }) => {
  /** Function to print array of label text or just a text. */
  const renderValues = ({ value }) => (isArray(value)
    ? <MiqStructuredListMultiRow value={value} />
    : <MiqStructuredListText value={value} />);

  /** Function to render an expansion right arrow which toggles to down arrow on its click event. */
  /** Usage eg: Compute / Container / Container Builds */
  const renderExpand = () => <div className="pull-right" />;

  /** Function to render the items of cell */
  return (
    <div className={classNames('content', row.bold ? 'label_header' : '', row.style)}>
      {row.icon && <MiqStructuredListIcon row={row} />}
      {row.image && <MiqStructuredListImage row={row} />}
      {row.button && <MiqStructuredListButton row={row} />}
      {renderValues(row)}
      {row.expandable && renderExpand(row)}
    </div>
  );
};

MiqStructuredListContent.propTypes = {
  row: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.shape({})]).isRequired,
};

export default MiqStructuredListContent;

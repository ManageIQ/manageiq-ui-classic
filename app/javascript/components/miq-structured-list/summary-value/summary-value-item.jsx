import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'carbon-components-react';
import { hasInput, rowProps } from '../helpers';
import MiqStructuredListInputs from '../miq-structured-list-inputs';
import SummaryValueItemContent from './summary-value-item-content';

const SummaryValueItem = ({ row, onClick }) => {
  /** Function to render textarea / checkbox / react components */
  const renderInputContent = ({ value }) => <MiqStructuredListInputs value={value} action={(data) => onClick(data)} />;

  const renderSimpleContents = (row) => {
    const content = <SummaryValueItemContent row={row} />;
    return row.link
      ? <Link href={row.link} to={row.link} onClick={(event) => onClick(event)} className="cell_link">{content}</Link>
      : content;
  };

  return (
    (hasInput(row.value)
      ? renderInputContent(row)
      : renderSimpleContents(row))
  );
};

export default SummaryValueItem;

SummaryValueItem.propTypes = {
  row: rowProps,
  onClick: PropTypes.func,
};

SummaryValueItem.defaultProps = {
  row: {
    icon: undefined,
    image: undefined,
    button: undefined,
    expandable: undefined,
    bold: undefined,
    style: undefined,
    link: undefined,
    value: undefined,
    label: undefined,
    sub_items: undefined,
  },
  onClick: undefined,
};

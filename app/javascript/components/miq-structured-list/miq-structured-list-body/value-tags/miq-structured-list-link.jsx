import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'carbon-components-react';
import MiqStructuredListContent from '../miq-structured-list-content';
import { customOnClickHandler } from '../../../../helpers/custom-click-handler';

/** Component to render a link in the cell.  */
const MiqStructuredListLink = ({ row, clickEvents, onClick }) => {
  const content = <MiqStructuredListContent row={row} />;

  /** Function to include content for mode that contains miq summary
    * if only link is passed as props we render Link with href tag
    * if link as well as onclick is passed as props we render Link with onclick function and without href
  */
  const renderLinkWithHrefOrOnclick = (row) => {
    if (row.link && row.onclick) {
      return (
        <Link to={row.link} onClick={() => customOnClickHandler(row.onclick)} className="cell_link">{content}</Link>
      );
    } if (row.link) {
      return (
        <Link href={row.link} to={row.link} className="cell_link">{content}</Link>
      );
    }
    return content;
  };

  if (clickEvents) {
    return renderLinkWithHrefOrOnclick(row);
  }

  return (row.link
    ? (
      <Link href={row.link} to={row.link} onClick={(e) => onClick(row, e)} className="cell_link">
        {content}
      </Link>
    )
    : content
  );
};

export default MiqStructuredListLink;

MiqStructuredListLink.propTypes = {
  row: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.shape({})]).isRequired,
  clickEvents: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

MiqStructuredListLink.defaultProps = {
  onClick: undefined,
};

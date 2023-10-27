/* eslint-disable react/no-danger */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import MiqStructuredListModeContext from '../../miq-structuted-list-mode-context';
import { DOMPurifyModes } from '../../helpers';

/** Component to print the text value inside a cell. */
const MiqStructuredListText = ({ value }) => {
  const mode = useContext(MiqStructuredListModeContext);
  const text = (value === null || value === undefined ? '' : String(value));
  const domPurify = DOMPurifyModes.includes(mode);

  return (
    <div className={classNames(text ? 'expand' : '', 'wrap_text')}>
      {
        domPurify ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }} /> : text
      }
    </div>
  );
};

export default MiqStructuredListText;

MiqStructuredListText.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.array, PropTypes.bool]),
};

MiqStructuredListText.defaultProps = {
  value: undefined,
};

import * as React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

const classNames = require('classnames');

const abbrNumber = (value) => {
  const num = numeral(value);
  // Return the input if it's not a number.
  if (!num.value() || num.value().toString() !== value.toString()) {
    return value;
  }

  let abbr = num.format('0.0a');
  if (abbr.match(/\d\.0[a-z]?$/) || abbr.length > 5) {
    // Drop the .0 as we want to save the space
    abbr = num.format('0a');
  }

  return abbr.toUpperCase();
};

const fontSize = (text) => {
  const len = text.length;

  if (len < 3) {
    return 'font-normal';
  } if (len > 2 && len < 4) {
    return 'font-small';
  }
  return 'font-tiny';
};

const Quaditem = (props) => {
  const {
    text, fonticon, color, fileicon, piechart, className, tooltip, background,
  } = props;
  const shortText = abbrNumber(text);
  const parts = [
    fonticon && (
      <div key="fonticon" className="fonticon">
        <i className={fonticon} style={color ? { color } : {}} />
      </div>
    ),
    !fonticon && fileicon && (
      <div key="fileicon" className="fileicon">
        <img alt="fileicon" src={fileicon} />
      </div>
    ),
    text && (
      <div key="text" className={`text ${fontSize(shortText)}`}>
        {shortText}
      </div>
    ),
    (piechart || piechart === 0) && (
      <div key="piechart" className={`piechart fill-${piechart}`} />
    ),
  ].filter(Boolean);
  return (
    <div className={classNames('miq-quaditem', className)} title={tooltip} style={{ background: background || 'initial' }}>
      {parts}
    </div>
  );
};

export default Quaditem;

/*
 * The Quaditem can contain the following keys:
 *   fonticon
 *   fileicon
 *   text
 *   tooltip
 *   background - background color of the given quadrant
 *   color - color of text/fonticon
 *   piechart - numeric value between 0..20, requires the .piechart CSS class from the demo to be extracted
 *   className - class of an individual quad calculated from `quadSet`
 */

Quaditem.propTypes = {
  className: PropTypes.string.isRequired,
  fonticon: PropTypes.string,
  fileicon: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tooltip: PropTypes.string,
  background: PropTypes.string,
  color: PropTypes.string,
  piechart: PropTypes.number,
};

Quaditem.defaultProps = {
  fonticon: undefined,
  fileicon: undefined,
  text: undefined,
  background: undefined,
  color: undefined,
  piechart: undefined,
  tooltip: undefined,
};

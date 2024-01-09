import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/** Component to display XML content.
 * Usage: Automation / Embedded Automate / Simulation.
*/
const XmlHolder = ({ xmlData }) => {
  useEffect(() => {
    const xmlHolder = document.getElementById('xml_holder');
    if (xmlHolder) {
      $(xmlHolder).xmlDisplay(xmlData);
    }
  }, []);

  return <div id="xml_holder" />;
};

XmlHolder.propTypes = {
  xmlData: PropTypes.string,
};

XmlHolder.defaultProps = {
  xmlData: undefined,
};

export default XmlHolder;

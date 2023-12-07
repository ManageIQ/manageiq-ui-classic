import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

/** Component to render the markdown contents. */
const MiqMarkdown = ({ content }) => <ReactMarkdown>{content}</ReactMarkdown>;

MiqMarkdown.propTypes = {
  content: PropTypes.string,
};

MiqMarkdown.defaultProps = {
  content: undefined,
};

export default MiqMarkdown;

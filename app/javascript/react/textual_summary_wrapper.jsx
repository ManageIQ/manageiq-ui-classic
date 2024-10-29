import React from 'react';
import ReactDOM from 'react-dom';
import { TextualSummary } from '../components/textual_summary';
import textualSummaryGenericClick from './textual_summary_click';

export default (props) => {
  // If id is explorer, change to explorer_wide on textual summary page to fit long titles on the same line.
  // Textual summary page has no search bar so we can use 100% width for the title.
  if (document.getElementById('explorer')) {
    document.getElementById('explorer').setAttribute('id', 'explorer_wide');
  }
  const onClick = props.onClick || textualSummaryGenericClick;
  const component = <TextualSummary onClick={onClick} {...props} />;
  if (props.options && Object.keys(props.options).length > 0) {
    document.addEventListener('DOMContentLoaded', () => {
      ReactDOM.render(component, document.body.appendChild(document.createElement('div')));
    });
  }
  return component;
};

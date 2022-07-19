import React from 'react';
import ReactDOM from 'react-dom';
import { TextualSummary } from '../components/textual_summary';
import textualSummaryGenericClick from './textual_summary_click';

export default (props) => {
  const onClick = props.onClick || textualSummaryGenericClick;
  const component = <TextualSummary onClick={onClick} {...props} />;
  if (props.options) {
    document.addEventListener('DOMContentLoaded', () => {
      ReactDOM.render(component, document.body.appendChild(document.createElement('div')));
    });
  }
  return component;
};

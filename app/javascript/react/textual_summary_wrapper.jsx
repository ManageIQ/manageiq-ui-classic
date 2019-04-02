import React from 'react';
import { TextualSummary } from '@manageiq/react-ui-components/dist/textual_summary';
import textualSummaryGenericClick from './textual_summary_click';

export default (props) => {
  const onClick = props.onClick || textualSummaryGenericClick;
  return <TextualSummary onClick={onClick} {...props} />;
};

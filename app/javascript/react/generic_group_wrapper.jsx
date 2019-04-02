import React from 'react';
import { GenericGroup } from '@manageiq/react-ui-components/dist/textual_summary';
import textualSummaryGenericClick from './textual_summary_click';

export default (props) => {
  const onClick = props.onClick || textualSummaryGenericClick;
  return <GenericGroup onClick={onClick} {...props} />;
};

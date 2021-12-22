/* eslint-disable react/prop-types */
import React from 'react';
import { TableListView } from '../components/textual_summary';
import textualSummaryGenericClick from './textual_summary_click';

export default (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const onClick = props.onClick || textualSummaryGenericClick;
  const { title, headers, values } = props;

  if (title === null || headers === null || values === null) {
    return null;
  }
  return <TableListView onClick={onClick} {...props} />;
};

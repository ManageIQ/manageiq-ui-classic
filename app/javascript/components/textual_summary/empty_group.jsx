import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

export default function EmptyGroup(props) {
  const { title } = props;
  return (
    <MiqStructuredList
      rows={[]}
      title={title}
      mode="generic_group"
    />
  );
}

EmptyGroup.propTypes = {
  title: PropTypes.string.isRequired,
};

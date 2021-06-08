import * as React from 'react';
import PropTypes from 'prop-types';
import TextualGroup from './textual_group';

export default function TextualRow(props) {
  const { groups } = props;
  const wide = groups.reduce((acc, group) => acc || group.wide, false);

  return (
    <div className={`col-md-12 ${wide ? 'col-lg-12' : 'col-lg-6'}`}>
      {
        groups.map((group) => (
          <TextualGroup onClick={props.onClick} key={group.title} group={group} />
        ))
      }
    </div>
  );
}

TextualRow.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};

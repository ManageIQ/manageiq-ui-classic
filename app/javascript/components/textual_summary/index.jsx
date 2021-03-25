import * as React from 'react';
import PropTypes from 'prop-types';
import TextualRow from './textual_row';

/**
 * Render a whole textual summary.
 *
 * Outer array elements are rows, inner array elements are groups.
 */
export const TextualSummary = props => (
  <div className="row">
    {
      props.summary.map((bigGroup, i) => (
        <TextualRow onClick={props.onClick} key={i} groups={bigGroup} />
      ))
    }
  </div>
);

TextualSummary.propTypes = {
  summary: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * Render a single group of Tags.
 */
export { default as TagGroup } from './tag_group';

/**
 * Render a list based group.
 */
export { default as TableListView } from './table_list_view';

/**
 * Render a single generic group of properties.
 */
export { default as GenericGroup } from './generic_group';

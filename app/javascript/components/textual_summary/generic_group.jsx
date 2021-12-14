import * as React from 'react';
import PropTypes from 'prop-types';
import GenericTableRow from './generic_table_row';
import MiqStructuredList from '../miq-structured-list';

export default function GenericGroup(props) {
  const { title, items } = props;
  return (
    <>
      <MiqStructuredList
        rows={items}
        title={title}
        mode="generic_group"
        onClick={(item, event) => props.onClick(item, event)}
      />
      <table className="table table-bordered table-hover table-striped table-summary-screen generic_groups">
        <thead>
          <tr>
            <th colSpan="2" align="left">{title}</th>
          </tr>
        </thead>
        <tbody>
          {
            items.map((item, i) => (
            // eslint-disable-next-line react/no-array-index-key
              <GenericTableRow onClick={props.onClick} key={i} item={item} />
            ))
          }
        </tbody>
      </table>
    </>
  );
}

GenericGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};

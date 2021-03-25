import * as React from 'react';
import PropTypes from 'prop-types';
import GenericGroup from './generic_group';
import TagGroup from './tag_group';
import SimpleTable from './simple_table';
import OperationRanges from './operation_ranges';
import MultilinkTable from './multilink_table';
import TableListView from './table_list_view';
import EmptyGroup from './empty_group';

const renderComponent = (props) => {
  switch (props.group.component) {
    case 'GenericGroup':
      return (
        <GenericGroup onClick={props.onClick} items={props.group.items} title={props.group.title} />
      );
    case 'TagGroup':
      return <TagGroup onClick={props.onClick} items={props.group.items} title={props.group.title} />;
    case 'SimpleTable':
      return (
        <SimpleTable
          labels={props.group.labels}
          rows={props.group.rows}
          title={props.group.title}
          onClick={props.onClick}
        />
      );
    case 'OperationRanges':
      return <OperationRanges items={props.group.items} title={props.group.title} />;
    case 'MultilinkTable':
      return (
        <MultilinkTable
          onClick={props.onClick}
          items={props.group.items}
          title={props.group.title}
        />
      );
    case 'TableListView':
      return (
        <TableListView
          rowLabel={props.group.rowLabel}
          onClick={props.onClick}
          title={props.group.title}
          headers={props.group.headers}
          values={props.group.values}
          colOrder={props.group.colOrder}
        />
      );
    case 'EmptyGroup':
      return <EmptyGroup title={props.group.title} text={props.group.text} />;
    default:
      return <span>Error: Unknown summary group type.</span>;
  }
};

export default function TextualGroup(props) {
  return renderComponent(props);
}

renderComponent.propTypes = {
  group: PropTypes.shape({
    title: PropTypes.string.isRequired,
    component: PropTypes.string.isRequired,
    items: PropTypes.any,
    labels: PropTypes.any,
    rows: PropTypes.any,
    rowLabel: PropTypes.string,
    headers: PropTypes.arrayOf(PropTypes.any),
    values: PropTypes.arrayOf(PropTypes.any),
    colOrder: PropTypes.arrayOf(PropTypes.any),
    text: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};


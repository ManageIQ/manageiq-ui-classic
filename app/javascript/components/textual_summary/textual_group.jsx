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
  const { group, onClick } = props;
  switch (props.group.component) {
    case 'GenericGroup':
      return (
        <GenericGroup onClick={onClick} items={group.items} title={group.title} />
      );
    case 'TagGroup':
      return <TagGroup onClick={onClick} items={group.items} title={group.title} />;
    case 'SimpleTable':
      return (
        <SimpleTable
          className={group.className}
          labels={group.labels}
          rows={group.rows}
          title={group.title}
          onClick={onClick}
        />
      );
    case 'OperationRanges':
      return <OperationRanges items={group.items} title={group.title} />;
    case 'MultilinkTable':
      return (
        <MultilinkTable
          onClick={onClick}
          items={group.items}
          title={group.title}
        />
      );
    case 'TableListView':
      return (
        <TableListView
          rowLabel={group.rowLabel}
          onClick={onClick}
          title={group.title}
          headers={group.headers}
          values={group.values}
          colOrder={group.colOrder}
        />
      );
    case 'EmptyGroup':
      return <EmptyGroup title={group.title} text={group.text} />;
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
    items: PropTypes.objectOf(PropTypes.any),
    labels: PropTypes.objectOf(PropTypes.any),
    rows: PropTypes.objectOf(PropTypes.any),
    rowLabel: PropTypes.string,
    headers: PropTypes.arrayOf(PropTypes.any),
    values: PropTypes.arrayOf(PropTypes.any),
    colOrder: PropTypes.arrayOf(PropTypes.any),
    text: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

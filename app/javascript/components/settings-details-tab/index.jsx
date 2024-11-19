import React, { useState } from 'react';
import MiqDataTable from '../miq-data-table';
import RegionForm from '../region-form';

const settingsDetailsTab = ({
  region, scanItemsCount, zonesCount, miqSchedulesCount,
}) => {
  const [rows, setRows] = useState([
    {
      id: '0',
      region: {
        text: `${region.description} [${region.region}]`,
        icon: 'carbon--Db2Database',
      },
      treeBox: 'settings_tree',
    },
    {
      id: '1',
      region: {
        text: `${__('Analysis Profiles')} (${scanItemsCount})`,
        icon: 'carbon--Search',
      },
      treeBox: 'settings_tree',
      nodeKey: 'xx-sis',
    },
    {
      id: '2',
      region: {
        text: `${__('Zones')} (${zonesCount})`,
        icon: 'carbon--CirclePacking',
      },
      treeBox: 'settings_tree',
      nodeKey: 'xx-z',
    },
    {
      id: '3',
      region: {
        text: `${__('Schedules')} (${miqSchedulesCount})`,
        icon: 'carbon--Time',
      },
      treeBox: 'settings_tree',
      nodeKey: 'xx-msc',
    },
  ]);

  const headers = [
    {
      key: 'region',
      header: '',
    },
  ];

  const onSelect = (selectedRow) => {
    const selected = rows.find((row) => row.id === selectedRow.id);
    if (selected.nodeKey) {
      miqTreeActivateNode(selected.treeBox, selected.nodeKey);
    } else {
      setRows((prevRows) => prevRows.filter((row) => row.id !== '0'));
    }
  };

  return (
    <div>
      {rows.find((row) => row.id === '0') === undefined && (
        <RegionForm maxDescLen={255} id={region.id.toString()} />
      )}
      <MiqDataTable rows={rows} headers={headers} onCellClick={(selectedRow) => onSelect(selectedRow)} />
    </div>
  );
};

export default settingsDetailsTab;

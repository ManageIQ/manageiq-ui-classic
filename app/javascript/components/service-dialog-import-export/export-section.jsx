import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, FilterableMultiSelect } from '@carbon/react';
import { setLocationHref } from '../../helpers/window-location';

const ExportSection = ({ dialogExports = [] }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const items = dialogExports.map(([label, id]) => ({ id: String(id), label }));

  const handleExport = () => {
    const query = selectedItems
      .map((item) => `service_dialogs[]=${encodeURIComponent(item.id)}`)
      .join('&');
    setLocationHref(`/miq_ae_customization/export_service_dialogs?${query}`);
  };

  return (
    <div className="service-dialog-export-section">
      <h3>{__('Export')}</h3>
      <FilterableMultiSelect
        id="service-dialog-export-select"
        titleText={__('Service Dialogs')}
        placeholder={__('Select service dialogs to export')}
        items={items}
        itemToString={(item) => (item ? item.label : '')}
        selectedItems={selectedItems}
        onChange={({ selectedItems: selected }) => setSelectedItems(selected)}
      />
      <div className="export-button-wrapper">
        <Button
          id="export-service-dialogs"
          type="button"
          disabled={selectedItems.length === 0}
          onClick={handleExport}
        >
          {__('Export')}
        </Button>
      </div>
    </div>
  );
};

ExportSection.propTypes = {
  dialogExports: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))),
};

export default ExportSection;

import { IconButton } from '@carbon/react';
import { Export } from '@carbon/react/icons';

const ExportSection = () => {
  const handleExport = () => {
    window.location.href = '/miq_ae_tools/export_datastore';
  };

  return (
    <div className="export-section">
      <h3>{__('Export')}</h3>
      <IconButton
        kind="secondary"
        label={__('Export all classes and instances to a file')}
        onClick={handleExport}
        align="right"
      >
        <Export />
      </IconButton>
    </div>
  );
};

export default ExportSection;

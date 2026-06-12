import { useState, useEffect } from 'react';
import { IconButton, Modal, Loading } from '@carbon/react';
import { Reset } from '@carbon/react/icons';
import { http } from '../../http_api';
import { locationReload } from '../../helpers/window-location';

const ResetDatastoreSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [domainNames, setDomainNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch enabled domains from API
    API.get('/api/automate_domains?expand=resources&attributes=name,enabled&filter[]=enabled=true')
      .then((response) => {
        const domains = response?.resources || [];
        const names = domains.map((domain) => domain.name);
        setDomainNames(names);
        setLoading(false);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch domains:', error);
        setLoading(false);
      });
  }, []);

  const handleReset = () => {
    setShowModal(false);
    miqSparkleOn();

    http.post('/miq_ae_tools/reset_datastore', { button: 'reset' })
      .then(() => {
        miqSparkleOff();
        locationReload();
      })
      .catch((error) => {
        miqSparkleOff();
        // eslint-disable-next-line no-console
        console.error('Reset failed:', error);
      });
  };

  if (loading) {
    return <Loading description={__('Loading domains...')} small />;
  }

  const domainList = domainNames.join(', ');
  const title = sprintf(
    __('Reset all components in the following domains: %s'),
    domainList,
  );

  return (
    <div className="reset-datastore-section">
      <h3>{title}</h3>
      <IconButton
        kind="secondary"
        label={__('Reset')}
        onClick={() => setShowModal(true)}
        align="right"
      >
        <Reset />
      </IconButton>

      <Modal
        open={showModal}
        modalHeading={__('Confirm Reset')}
        primaryButtonText={__('Reset')}
        secondaryButtonText={__('Cancel')}
        onRequestClose={() => setShowModal(false)}
        onRequestSubmit={handleReset}
        danger
      >
        <p>
          {__(
            'All Datastore customizations will be lost. Are you sure you want to reset all classes and instances to default?',
          )}
        </p>
      </Modal>
    </div>
  );
};

export default ResetDatastoreSection;

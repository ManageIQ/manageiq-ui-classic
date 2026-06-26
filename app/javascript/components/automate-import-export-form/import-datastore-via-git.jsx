import PropTypes from 'prop-types';
import { Button } from '@carbon/react';

const ImportDatastoreViaGit = ({ onOpenModal, disableSubmit }) => (
  <div className="import-datastore-via-git">
    <h3>{__('Import Datastore via Git')}</h3>
    {disableSubmit && (
      <p className="bx--form__helper-text">
        {__('Please enable the git owner role in order to import git repositories')}
      </p>
    )}
    <Button
      kind="primary"
      onClick={onOpenModal}
      disabled={disableSubmit}
    >
      {__('Import from Git Repository')}
    </Button>
  </div>
);

ImportDatastoreViaGit.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
  disableSubmit: PropTypes.bool,
};

ImportDatastoreViaGit.defaultProps = {
  disableSubmit: false,
};

export default ImportDatastoreViaGit;

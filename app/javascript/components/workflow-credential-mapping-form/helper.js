import React from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import MiqDataTable from '../miq-data-table';

export const CredentialMapperComponent = (props) => {
  const { rows, onCellClick } = useFieldApi(props);
  const formOptions = useFormApi();

  return (
    <div className="credential-mapper-data-table">
      <MiqDataTable
        headers={[
          { key: 'CredentialsIdentifier', header: __('Credentials Identifier') },
          { key: 'CredentialRecord', header: __('Credential Record') },
          { key: 'CredentialField', header: __('Credential Field') },
          { key: 'Delete', header: __('Delete') },
        ]}
        rows={rows}
        size="md"
        onCellClick={(selectedRow, cellType) => onCellClick(selectedRow, cellType, formOptions)}
      />
    </div>
  );
};

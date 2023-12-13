import React from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import { Button } from 'carbon-components-react';
import MiqDataTable from '../miq-data-table';

export const SubscriptionsTableComponent = (props) => {
  const {
    rows, onCellClick, addButtonLabel, onButtonClick,
  } = useFieldApi(props);
  const formOptions = useFormApi();

  return (
    <div className="subscriptions-table">
      <Button
        kind="primary"
        className="subscription-add bx--btn bx--btn--primary pull-right"
        type="button"
        variant="contained"
        onClick={() => onButtonClick(formOptions)}
      >
        {addButtonLabel}
      </Button>

      <MiqDataTable
        headers={[
          { key: 'dbname', header: __('Database') },
          { key: 'host', header: __('Host') },
          { key: 'user', header: __('Username') },
          { key: 'password', header: __('Password') },
          { key: 'port', header: __('Port') },
          { key: 'backlog', header: __('Backlog') },
          { key: 'status', header: __('Status') },
          { key: 'provider_region', header: __('Region') },
          { key: 'edit', header: __('Edit') },
          { key: 'delete', header: __('Delete') },
        ]}
        rows={rows}
        size="md"
        onCellClick={(selectedRow, cellType) => onCellClick(selectedRow, cellType, formOptions)}
      />
    </div>
  );
};

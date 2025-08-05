// import React from 'react';
import React, { useEffect } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import { Button } from 'carbon-components-react';
import MiqDataTable from '../../../miq-data-table';

export const SchemaTableComponent = (props) => {
  const {
    input, rows, onCellClick, onButtonClick,
  } = useFieldApi(props);
  const formOptions = useFormApi();

  useEffect(() => {
    input.onChange(rows);
  }, [rows]);

  return (
    <div className="schema-section">
      <div className="schema-button" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button
          kind="primary"
          className="schema-add bx--btn bx--btn--primary pull-right"
          type="button"
          variant="contained"
          onClick={() => onButtonClick(formOptions)}
        >
          {__('Add a Field')}
        </Button>
      </div>
      <div className="schema-table" style={{ display: 'grid', overflow: 'auto' }}>
        <MiqDataTable
          headers={[
            { key: 'name', header: __('Name') },
            { key: 'description', header: __('Description') },
            { key: 'default_value', header: __('Default Value') },
            { key: 'collect', header: __('Collect') },
            { key: 'message', header: __('Message') },
            { key: 'on_entry', header: __('On Entry') },
            { key: 'on_exit', header: __('On Exit') },
            { key: 'on_error', header: __('On Error') },
            { key: 'max_retries', header: __('Max Retries') },
            { key: 'max_time', header: __('Max Time') },
            { key: 'edit', header: __('Edit') },
            { key: 'delete', header: __('Delete') },
          ]}
          rows={rows}
          size="md"
          sortable={false}
          onCellClick={(selectedRow, cellType) => onCellClick(selectedRow, cellType, formOptions)}
        />
      </div>
    </div>
  );
};

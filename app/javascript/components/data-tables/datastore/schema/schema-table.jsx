import { useEffect, useRef } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import { Button } from '@carbon/react';
import MiqDataTable from '../../../miq-data-table';
import { schemaHeaders } from '../helper';

export const SchemaTableComponent = (props) => {
  const {
    input, rows, onCellClick, onButtonClick,
  } = useFieldApi(props);
  const formOptions = useFormApi();
  const headers = schemaHeaders(true).map(({ name, header_text: header }) => ({ key: name, header }));
  const onChangeRef = useRef(input.onChange);
  onChangeRef.current = input.onChange;

  useEffect(() => {
    onChangeRef.current(rows);
  }, [rows]);

  return (
    <div className="schema-section">
      <div className="schema-button">
        <Button
          kind="primary"
          className="schema-add"
          type="button"
          onClick={() => onButtonClick(formOptions)}
        >
          {__('Add a Field')}
        </Button>
      </div>
      <div className="schema-table">
        <MiqDataTable
          headers={headers}
          rows={rows}
          size="md"
          sortable={false}
          onCellClick={(selectedRow, cellType) => onCellClick(selectedRow, cellType, formOptions)}
        />
      </div>
    </div>
  );
};

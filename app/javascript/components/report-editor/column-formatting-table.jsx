import { useFieldApi } from '@@ddf';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TextInput,
  Select,
  SelectItem,
} from '@carbon/react';
import { useFieldMetadata } from './field-metadata-context';

/**
 * ColumnFormattingTable — custom DDF component.
 *
 * Bound to `col_options` in form state (object keyed by field id).
 * Subscribes to `col_order` via useFieldApi so it re-renders whenever the
 * user reorders or adds/removes columns in the field picker.
 * Reads available fields and per-field formats from FieldMetadataContext
 * instead of form state.
 */
const ColumnFormattingTable = (props) => {
  const {
    input: { value: colOptions = {}, onChange },
  } = useFieldApi(props);
  // Subscribe to col_order so the table re-renders when order changes.
  const { input: { value: colOrder = [] } } = useFieldApi({ name: 'col_order' });
  const { availableFields, fieldMetadata } = useFieldMetadata();

  // Build a label map from available_fields [[label, id], ...]
  const labelMap = Object.fromEntries((availableFields || []).map(([label, id]) => [id, label]));

  const updateOption = (fieldId, key, val) => {
    onChange({ ...colOptions, [fieldId]: { ...(colOptions[fieldId] || {}), [key]: val } });
  };

  const tableHeaders = [
    { key: 'field', header: __('Column name') },
    { key: 'header', header: __('Header') },
    { key: 'format', header: __('Format') },
  ];

  // col_options is the source of truth for which fields are selected and their settings;
  // use colOrder only for display ordering, falling back to col_options keys
  const orderedIds = colOrder.length > 0 ? colOrder : Object.keys(colOptions);
  const rows = orderedIds.map((fieldId) => ({
    id: fieldId,
    field: labelMap[fieldId] || fieldId,
    header: colOptions[fieldId]?.header ?? '',
    format: colOptions[fieldId]?.format ?? '',
  }));

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="report-editor-formatting-table">
      <h4 className="report-editor-formatting-table__heading">
        {__('Column headers and formatting')}
      </h4>
      <DataTable key={orderedIds.join(',')} rows={rows} headers={tableHeaders} size="sm">
        {({
          rows: tableRows,
          headers: renderedHeaders,
          getTableProps,
          getRowProps,
        }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {renderedHeaders.map(({ key, header: headerText, ...headerProps }) => (
                  <TableHeader key={key} {...headerProps}>{headerText}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map((row) => {
                const fieldId = row.id;
                const fieldMeta = (fieldMetadata || {})[fieldId] || {};
                const formats = fieldMeta.available_formats || [];
                const { key, ...rowProps } = getRowProps({ row });
                // Read live values from colOptions directly — DataTable's internal
                // row state is stale after an onChange, so we bypass cell.value
                const headerVal = colOptions[fieldId]?.header ?? '';
                const formatVal = colOptions[fieldId]?.format ?? '';
                return (
                  <TableRow key={key} {...rowProps}>
                    <TableCell>{labelMap[fieldId] || fieldId}</TableCell>
                    <TableCell>
                      <TextInput
                        id={`col-header-${fieldId}`}
                        labelText=""
                        hideLabel
                        value={headerVal}
                        maxLength={40}
                        onChange={(e) => updateOption(fieldId, 'header', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      {formats.length > 0 ? (
                        <Select
                          id={`col-format-${fieldId}`}
                          labelText=""
                          hideLabel
                          value={formatVal}
                          onChange={(e) => updateOption(fieldId, 'format', e.target.value)}
                        >
                          <SelectItem value="_none_" text={__('<None>')} />
                          <SelectItem value="" text={__('<Reset to Default>')} />
                          {formats.map(([label, val]) => (
                            <SelectItem key={val} value={val} text={label} />
                          ))}
                        </Select>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

ColumnFormattingTable.displayName = 'ColumnFormattingTable';

export default ColumnFormattingTable;

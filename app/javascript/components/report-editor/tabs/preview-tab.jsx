import { useState, useCallback } from 'react';
import {
  Button,
  DataTable,
  InlineNotification,
  Loading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { Renew } from '@carbon/react/icons';
import { useFormApi, useFieldApi } from '@@ddf';

const buildReportData = (values) => {
  const colOrder = values.col_order || [];
  const colOptions = values.col_options || {};
  const headers = colOrder.map((id) => colOptions[id]?.header || '');
  const colFormats = colOrder.map((id) => colOptions[id]?.format || '');
  return {
    name: values.name,
    title: values.title,
    model: values.model,
    col_order: colOrder,
    headers,
    col_formats: colFormats,
    col_options: colOptions,
    record_filter: values.record_filter,
    display_filter: values.display_filter,
    sortby: values.sortby,
    order: values.order,
    group: values.group,
    tz: values.tz,
  };
};

const PreviewTab = () => {
  const formOptions = useFormApi();
  const { input: { value: colOrder = [] } } = useFieldApi({ name: 'col_order' });

  const [{ isLoading, data, error }, setState] = useState({
    isLoading: false,
    data: null,
    error: null,
  });

  const fetchPreview = useCallback(() => {
    const { values } = formOptions.getState();
    const currentColOrder = values.col_order || [];

    if (currentColOrder.length === 0) {
      setState({ isLoading: false, data: null, error: null });
      return;
    }

    setState({ isLoading: true, data: null, error: null });
    http.post('/report/react_preview', { report_data: buildReportData(values) })
      .then((result) => {
        setState({ isLoading: false, data: result, error: null });
      })
      .catch((err) => {
        setState({
          isLoading: false,
          data: null,
          error: err.data?.message || err.message || __('Failed to load preview data.'),
        });
      });
  }, [formOptions]);

  const renderContent = () => {
    if (colOrder.length === 0) {
      return (
        <p className="report-editor-filter__text-muted">
          {__('Add columns on the Columns tab, then click Refresh to preview.')}
        </p>
      );
    }

    if (isLoading) {
      return <Loading small withOverlay={false} />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          role="alert"
          title={error}
          lowContrast
          hideCloseButton
        />
      );
    }

    if (!data) {
      return (
        <p className="report-editor-filter__text-muted">
          {__('Click Refresh to preview the current report configuration.')}
        </p>
      );
    }

    const columns = data.columns || [];
    const colKeys = data.col_keys || columns;
    const rows = data.rows || [];

    if (columns.length === 0) {
      return <p>{__('No data returned for this report.')}</p>;
    }

    const tableHeaders = columns.map((col, idx) => ({ key: colKeys[idx] || col, header: col }));
    const tableRows = rows.map((row, idx) => ({
      id: String(idx),
      ...colKeys.reduce((acc, key, colIdx) => {
        acc[key] = Array.isArray(row) ? (row[colIdx] ?? '') : (row[key] ?? '');
        return acc;
      }, {}),
    }));

    return (
      <DataTable rows={tableRows} headers={tableHeaders}>
        {({
          rows: tableRowData,
          headers: tableHdrs,
          getTableProps,
          getHeaderProps,
          getRowProps,
        }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {tableHdrs.map((header) => {
                  const { key: _k, ...headerProps } = getHeaderProps({ header });
                  return (
                    <TableHeader key={header.key} {...headerProps}>
                      {header.header}
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRowData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableHdrs.length}>
                    {__('No data returned for this report.')}
                  </TableCell>
                </TableRow>
              ) : (
                tableRowData.map((row) => {
                  const { key: _k, ...rowProps } = getRowProps({ row });
                  return (
                    <TableRow key={row.id} {...rowProps}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </DataTable>
    );
  };

  return (
    <div className="report-editor-preview">
      <div className="report-editor-preview__toolbar">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Renew}
          iconDescription={__('Refresh')}
          onClick={fetchPreview}
          disabled={isLoading}
        >
          {__('Refresh')}
        </Button>
      </div>
      {renderContent()}
    </div>
  );
};

export default PreviewTab;

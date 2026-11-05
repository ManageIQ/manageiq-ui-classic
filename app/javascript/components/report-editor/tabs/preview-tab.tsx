import {
  useState, useCallback, useEffect, useRef,
} from 'react';
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
import type { ReportFormValues } from '../report-editor-types';
import { buildReportData } from '../report-form-values';

type PreviewData = {
  columns?: string[];
  col_keys?: string[];
  rows?: (string[] | Record<string, string>)[];
};

// The server queues the report on a reporting worker: `preview` answers with a task id,
// `preview_result` is polled until the task has finished.
type PreviewResponse = PreviewData & { task_id?: number; complete?: boolean };

const POLL_INTERVAL_MS = 1000;

type PreviewState = {
  isLoading: boolean;
  data: PreviewData | null;
  error: string | null;
};

const PreviewTab = () => {
  const formOptions = useFormApi();
  const { input: { value: colOrder = [] as string[] } } = useFieldApi({ name: 'col_order' });

  const [{ isLoading, data, error }, setState] = useState<PreviewState>({
    isLoading: false,
    data: null,
    error: null,
  });

  // Identifies the latest Refresh; polling of an older (or unmounted) request stops when it no longer matches.
  const latestRequestRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    latestRequestRef.current += 1;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const fetchPreview = useCallback(() => {
    const { values } = formOptions.getState();
    const currentColOrder: string[] = (values as ReportFormValues).col_order || [];

    stopPolling();
    const requestId = latestRequestRef.current;

    if (currentColOrder.length === 0) {
      setState({ isLoading: false, data: null, error: null });
      return;
    }

    const fail = (err: { data?: { message?: string }; message?: string }) => {
      if (requestId !== latestRequestRef.current) {
        return;
      }
      setState({
        isLoading: false,
        data: null,
        error: err.data?.message || err.message || __('Failed to load preview data.'),
      });
    };

    const poll = (taskId: number) => {
      http.get<PreviewResponse>(`/report/preview_result?task_id=${taskId}`)
        .then((result) => {
          if (requestId !== latestRequestRef.current) {
            return;
          }
          if (result.complete === false) {
            pollTimerRef.current = setTimeout(() => poll(taskId), POLL_INTERVAL_MS);
            return;
          }
          setState({ isLoading: false, data: result, error: null });
        })
        .catch(fail);
    };

    setState({ isLoading: true, data: null, error: null });
    http.post<PreviewResponse>('/report/preview', { report_data: buildReportData(values as ReportFormValues) })
      .then((result) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        if (result.task_id === undefined) {
          // Nothing to generate: the server answered with the (empty) preview directly.
          setState({ isLoading: false, data: result, error: null });
          return;
        }
        poll(result.task_id);
      })
      .catch(fail);
  }, [formOptions, stopPolling]);

  const renderContent = () => {
    if ((colOrder as string[]).length === 0) {
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
      ...colKeys.reduce<Record<string, string>>((acc, key, colIdx) => {
        acc[key] = Array.isArray(row) ? (row[colIdx] ?? '') : ((row as Record<string, string>)[key] ?? '');
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

import {
  DataTable,
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListRow,
  StructuredListWrapper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import type { ReportData, ReportProps, SummarySection } from './utilization-types';

const SECTIONS = [
  { key: 'cpu', label: __('CPU') },
  { key: 'memory', label: __('Memory') },
  { key: 'storage', label: __('Disk') },
];

const HEADERS = [
  { key: 'item', header: __('Item') },
  { key: 'value', header: __('Value') },
];

const UtilizationReport = ({
  hasTrendData,
  summary = null,
  trendStart = '',
  trendEnd = '',
  timezone = '',
  noNodeSelected = false,
}: ReportProps) => {
  if (!hasTrendData) {
    const message = noNodeSelected
      ? __('Select a node on the left to view Utilization report.')
      : __('No performance data is available for the selected item.');

    return (
      <InlineNotification
        kind="info"
        title={message}
        lowContrast
        hideCloseButton
      />
    );
  }

  const parsedSummary: ReportData = typeof summary === 'string' ? JSON.parse(summary) : (summary ?? {});

  const infoRows = (parsedSummary.info ?? []).map(([term, description], idx) => ({ id: String(idx), term, description }));

  const sections = SECTIONS.map(({ key, label }): SummarySection | null => {
    const rows = parsedSummary[key as keyof ReportData] as string[][] | undefined;
    if (!rows || !rows.length) {
      return null;
    }

    return {
      key,
      label,
      rows: rows.map(([item, value], idx) => ({ id: String(idx), item, value })),
    };
  }).filter((s): s is SummarySection => s !== null);

  return (
    <>
      {infoRows.length > 0 && (
        <>
          <hr />
          <h3>{__('Basic Information')}</h3>
          <StructuredListWrapper aria-label={__('Basic Information')} isCondensed>
            <StructuredListBody>
              {infoRows.map(({ id, term, description }) => (
                <StructuredListRow key={id}>
                  <StructuredListCell head>{term}</StructuredListCell>
                  <StructuredListCell>{description}</StructuredListCell>
                </StructuredListRow>
              ))}
            </StructuredListBody>
          </StructuredListWrapper>
        </>
      )}

      {sections.map(({ key, label, rows }) => (
        <div key={key}>
          <hr />
          <DataTable rows={rows} headers={HEADERS}>
            {({
              rows: tableRows,
              getRowProps,
              getTableProps,
            }) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableHeader colSpan={2}>{label}</TableHeader>
                  </TableRow>
                </TableHead>
                <colgroup>
                  <col />
                  <col style={{ width: '30%' }} />
                </colgroup>
                <TableBody>
                  {tableRows.map((row) => {
                    const { key: rKey, ...rowProps } = getRowProps({ row });
                    return (
                      <TableRow key={rKey} {...rowProps}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </div>
      ))}

      <hr />
      <p>
        {sprintf(
          __('* Information shown is based on available trend data from %s to %s in the %s time zone.'),
          trendStart,
          trendEnd,
          timezone,
        )}
      </p>
    </>
  );
};

export default UtilizationReport;

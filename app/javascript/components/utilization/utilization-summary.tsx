import {
  DataTable,
  InlineNotification,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import type { SummaryData, SummaryProps, SummarySection } from './utilization-types';

const SECTIONS = [
  { key: 'cpu', label: __('CPU') },
  { key: 'memory', label: __('Memory') },
  { key: 'storage', label: __('Disk') },
];

const HEADERS = [
  { key: 'item', header: __('Item') },
  { key: 'value', header: __('Value') },
];

const UtilizationSummary = ({
  hasTrendData,
  summary = null,
  model = null,
  trendStart = '',
  trendEnd = '',
  timezone = '',
  noNodeSelected = false,
}: SummaryProps) => {
  if (!hasTrendData) {
    const message = noNodeSelected
      ? __('Select a node on the left to view Utilization information.')
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

  const parsedSummary: SummaryData = typeof summary === 'string' ? JSON.parse(summary) : (summary ?? {});

  const sections = SECTIONS.map(({ key, label }): SummarySection | null => {
    const rows = parsedSummary[key as keyof SummaryData];
    if (!rows || !rows.length) {
      return null;
    }

    const filtered = rows
      .filter(([_item, _value, type]) => (
        type === 'trend_max'
        || type === 'total'
        || (type === 'available' && model !== 'Host')
      ))
      .map(([item, value], idx) => ({ id: String(idx), item, value }));

    if (!filtered.length) {
      return null;
    }

    return { key, label, rows: filtered };
  }).filter((s): s is SummarySection => s !== null);

  return (
    <>
      <hr />
      {sections.map(({ key, label, rows }, idx) => (
        <div key={key}>
          {idx > 0 && <hr />}
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

export default UtilizationSummary;

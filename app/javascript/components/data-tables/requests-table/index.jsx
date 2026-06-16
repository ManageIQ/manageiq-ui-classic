
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import MiqDataTable from '../../miq-data-table';

const RequestsTable = ({
  initialData,
}) => {
  const [tableHeaders, setTableHeaders] = useState([
    { key: 'time', header: __('Time'), sortData: { isFilteredBy: false } },
    { key: 'severity', header: __('Severity'), sortData: { isFilteredBy: false } },
    { key: 'message', header: __('Message'), sortData: { isFilteredBy: false } },
  ]);
  const [tableRows, setTableRows] = useState([]);

  const onSort = ({ key, sortData: { sortDirection } }) => {
    const temp = [...tableRows];
    let direction = !!sortDirection ? sortDirection : 'DESC';

    switch (key) {
      case 'time':
        if (direction === 'DESC') {
          temp.sort((x, y) => x.id - y.id);
          direction = 'ASC';
        } else if (direction === 'ASC') {
          temp.reverse((x, y) => x.id - y.id);
          direction = 'DESC';
        }
        setTableHeaders([
          { key: 'time', header: __('Time'), sortData: { isFilteredBy: true, sortDirection: direction } },
          { key: 'severity', header: __('Severity'), sortData: { isFilteredBy: false } },
          { key: 'message', header: __('Message'), sortData: { isFilteredBy: false } },
        ]);
        break;
      case 'severity':
        if (direction === 'DESC') {
          temp.sort((x, y) => {
            if (x.severity.text.toLowerCase() < y.severity.text.toLowerCase()) {
              return -1;
            }
            if (x.severity.text.toLowerCase() > y.severity.text.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          direction = 'ASC';
        } else if (direction === 'ASC') {
          temp.reverse((x, y) => {
            if (x.severity.text.toLowerCase() < y.severity.text.toLowerCase()) {
              return -1;
            }
            if (x.severity.text.toLowerCase() > y.severity.text.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          direction = 'DESC';
        }
        setTableHeaders([
          { key: 'time', header: __('Time'), sortData: { isFilteredBy: false } },
          { key: 'severity', header: __('Severity'), sortData: { isFilteredBy: true, sortDirection: direction } },
          { key: 'message', header: __('Message'), sortData: { isFilteredBy: false } },
        ]);
        break;
      case 'message':
        if (direction === 'DESC') {
          temp.sort((x, y) => {
            if (x.message.text.toLowerCase() < y.message.text.toLowerCase()) {
              return -1;
            }
            if (x.message.text.toLowerCase() > y.message.text.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          direction = 'ASC';
        } else if (direction === 'ASC') {
          temp.reverse((x, y) => {
            if (x.message.text.toLowerCase() < y.message.text.toLowerCase()) {
              return -1;
            }
            if (x.message.text.toLowerCase() > y.message.text.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          direction = 'DESC';
        }
        setTableHeaders([
          { key: 'time', header: __('Time'), sortData: { isFilteredBy: false } },
          { key: 'severity', header: __('Severity'), sortData: { isFilteredBy: false } },
          { key: 'message', header: __('Message'), sortData: { isFilteredBy: true, sortDirection: direction } },
        ]);
        break;
      default:
        break;
    }

    setTableRows(temp);
  };

  useEffect(() => {
    const rows = [];
    // const timeNow = Date.now();
    initialData.forEach((object, index) => {
      // Format timestamp using ManageIQ timezone to match the "Created On" field
      const timezone = ManageIQ.timezone || 'UTC';
      const formattedTime = object.created_at
        ? moment(object.created_at).tz(timezone).format('MM/DD/YYYY HH:mm:ss z')
        : 'unknown';

      rows[index] = {
        id: index.toString(),
        clickable: null,
        time: { text: formattedTime },
        severity: { text: object.severity ? object.severity : 'unknown' },
        message: { text: object.message ? object.message : '' },
      };
    });
    setTableRows(() => (rows));
  }, [initialData]);

  return (
    tableRows.length > 0 && (
      <div className="requests-table">
        <MiqDataTable
          rows={tableRows}
          headers={tableHeaders}
          size="xs"
          truncateText={false}
          stickyHeader
          sortable
          onSort={onSort}
        />
      </div>
    )
  );
};

RequestsTable.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.shape({
    created_at: PropTypes.string,
    severity: PropTypes.string,
    message: PropTypes.string,
  })),
};

RequestsTable.defaultProps = {
  initialData: [],
};

export default RequestsTable;

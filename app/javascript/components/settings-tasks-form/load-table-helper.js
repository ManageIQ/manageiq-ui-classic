import moment from 'moment-timezone';

// values = User selected values, tz = Timezone object from Ruby code, users = Current userid
const loadTable = (values, tz, users) => {
  const filters = [];
  const {
    zone, timePeriod, taskStatus, taskState, user,
  } = values; // User selected values

  // Parses the string returned by the 24 hour time period field into an integer representing the number of days ago
  const daysDiff = parseInt(timePeriod, 10);
  // Find current day in user set time zone, subtract the number of days ago and set time to start/end of day
  const startOfDay = moment.tz(tz.tzinfo.info.identifier).subtract(daysDiff, 'days').startOf('day').format();
  const endOfDay = moment.tz(tz.tzinfo.info.identifier).subtract(daysDiff, 'days').endOf('day').format();

  // These are the filters for the data table created based on user selected fields
  filters.push(
    [
      'with_updated_on_between',
      startOfDay,
      endOfDay,
    ]
  );
  if (zone !== 'all') {
    filters.push(
      [
        'with_zone',
        zone,
      ],
    );
  }
  if (user !== undefined && user !== 'all') {
    filters.push(
      [
        'with_userid',
        user,
      ],
    );
  } else if (user === undefined) {
    filters.push(
      [
        'with_userid',
        users,
      ],
    );
  }
  if (typeof taskStatus !== 'string') {
    if (taskStatus.length !== 5) {
      filters.push(
        [
          'with_status_in',
          ...taskStatus,
        ],
      );
    }
  }
  if (taskState !== 'all') {
    filters.push(
      [
        'with_state',
        taskState,
      ],
    );
  }
  // Creates the data table with data based on the above filters
  sendDataWithRx({ type: 'setScope', namedScope: filters });
};

export default loadTable;

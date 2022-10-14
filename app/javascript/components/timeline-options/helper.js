const smartOrStatements = (group, array) => {
  let shortUrl = '';
  let index = array.length - 1;
  while (index > 0) {
    shortUrl += `&filter[]=or%20${group}=${array[index]}`;
    index -= 1;
  }
  shortUrl = `&filter[]=${group}=${array[0]}${shortUrl}`;
  return shortUrl;
};

/** Function to build the URL to populate the timeline data table. */
export const buildUrl = (values) => {
  let url = `/api/event_streams?limit=5000&offset=0&expand=resources&attributes=group,group_level,group_name,id,event_type,message,ems_id,type,timestamp,created_on`;
  url += `&filter[]=type=${values.timeline_events}`;
  if (values.timeline_events === 'EmsEvent') { // Management Events
    url += smartOrStatements('group_level', values.management_group_levels);
    url += smartOrStatements('group', values.management_group_names);
  } else { // values.timeline_events == 'MiqEvent' // Policy Event
    url += `&filter[]=group_level=${values.policy_group_levels}`;
    url += smartOrStatements('group', values.policy_group_names);
  }
  url += `&filter[]=timestamp>${values.startDate[0].toISOString()}`;
  url += `&filter[]=timestamp<${values.endDate[0].toISOString()}`;

  return url;
};

/** Function to generate data for timeline view table. */
export const tableData = (initialData) => {
  const headers = [
    { key: 'event_type', header: __('Event Type') },
    { key: 'message', header: __('Message') },
    { key: 'type', header: __('Event Type') },
    { key: 'timestamp', header: __('Timestamp') },
    { key: 'created_on', header: __('Created On') },
    { key: 'group', header: __('Group') },
    { key: 'group_level', header: __('Group Level') },
    { key: 'group_name', header: __('Name') },
  ];

  initialData.resources.forEach((item) => {
    if (item.message === undefined || item.message === null) {
      item.message = '';
    }
    item.clickable = false;
  });

  return { headers, rows: initialData.resources };
};

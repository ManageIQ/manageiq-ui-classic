export const timelineUiOptions = (title) => ({
  title,
  axes: {
    bottom: {
      title: __('Date'),
      mapsTo: 'date',
      scaleType: 'time',
    },
    left: {
      title: __('# of Events'),
      mapsTo: 'value',
      scaleType: 'linear',
    },
  },
  legend: {
    clickable: true,
  },
  tooltip: {
    totalLabel: __('Total Events'),
  },
  points: {
    radius: 3,
    fillOpacity: 1,
    filled: true,
    enabled: true,
  },
  zoomBar: {
    top: {
      className: 'zoom-bar',
      enabled: true,
      type: 'graph_view',
    },
  },
  height: '400px',
});

const smartAndOrStatements = (group, array) => {
  const item = (array.length === 1) ? array[0] : `[${array.toString()}]`;
  return `&filter[]=${group}=${item}`;
};

/** Function to build the URL to get all events that fall under the user selected parameters. */
export const buildUrl = (values, pageFilters) => {
  // TODO: Different timeline show different data, ensure all necesary data is pulled
  let url = `/api/event_streams?limit=5000&offset=0&expand=resources`;
  url += `&attributes=group,group_level,group_name,id,event_type,ems_id,type,timestamp,created_on,host,source,message`;
  url += `,vm,ext_management_system`; // TODO heavy stuff to call in, but needed to be displayed in table

  // Page determined values
  Object.entries(pageFilters[values.type]).forEach(([key, value]) => {
    url += `&filter[]=${key}=${value}`;
  });

  // User set values
  url += `&filter[]=type=${values.type}`;
  url += smartAndOrStatements('group', values.group);
  url += smartAndOrStatements('group_level', values.group_level);

  if (values.start_date) {
    url += `&filter[]=timestamp%3E${values.start_date[0].toISOString()}`;
  }
  if (values.end_date) {
    url += `&filter[]=timestamp%3C${values.end_date[0].toISOString()}`;
  }
  return url;
};

/** Function to format the raw data such that it can be used by the Timeline Chart component */
export const buildChartDataObject = (rawData) => {
  // https://codesandbox.io/s/tender-river-9t3vu5?file=/src/index.js
  // Link to how a dataset object should look like
  const datasets = [];
  rawData.resources.forEach((event) => {
    const idx = datasets.findIndex((element) => {
      if (element.date === event.timestamp && element.group === event.group_name) {
        return true;
      }
      return false;
    });
    if (datasets[idx]) {
      datasets[idx].value += 1;
      datasets[idx].eventsObj.push(event);
    } else { // idx comes back as -1 when its undefined
      const obj = {
        group: event.group_name,
        date: event.timestamp ? event.timestamp : event.created_on,
        value: 1,
        eventsObj: [event],
      };
      datasets.push(obj);
    }
  });
  datasets.sort((a, b) => new Date(b.date) - new Date(a.date));
  return datasets;
};

/** Function to go through all the data pulled by the form submit and finds the right objects */
export const buildDataTableObject = (pointChoice) => {
  const tableData = [];
  pointChoice.eventsObj.forEach((event) => {
    // TODO: Different timeline show different data, ensure all necesary data is included
    const eventObj = {
      event_type: event.event_type,
      source: event.source,
      group_level: event.group_level,
      timestamp: event.timestamp,
      provider: {
        is_link: true,
        href: (event.ext_management_system === null) ? '' : `/ems_infra/show/${event.ext_management_system.id}`,
        label: (event.ext_management_system === null) ? '' : event.ext_management_system.name,
      },
      // provider_username: '', // unclear where to get this information from
      message: (event.message === null) ? '' : event.message,
      host: {
        is_link: true,
        href: (event.host === null) ? '' : `/host/show/${event.host.id}`,
        label: (event.host === null) ? '' : event.host.name,
      },
      source_vm: {
        is_link: true,
        href: (event.vm === null) ? '' : `/vm_infra/show/${event.vm.id}`,
        label: (event.vm === null) ? '' : event.vm.name,
      },
      source_vm_location: (event.vm === null) ? '' : event.vm.location,
      id: event.id,
      // cluster: '', // unclear how to get
    };
    tableData.push(eventObj);
  });
  return tableData;
};

/* eslint-disable radix */
/** Icons used in report list. */
const ReportIcons = {
  folderClose: 'fa-lg pficon-folder-close',
  folderCloseBlue: 'fa-lg pficon-folder-close-blue',
  fileText: 'fa fa-lg fa-file-text-o',
};

/** Headers used on all report list. */
const defaultHeaders = [{ key: 'name', header: __('Name') }];

/** Additional headers used in levelFour report list. */
const additionalHeaders = [
  { key: 'filters', header: __('Primary (Record) Filter') },
  { key: 'display_filters', header: __('Secondary (Display) Filter') },
  { key: 'sortby', header: __('Sort By') },
  { key: 'charts', header: __('Chart') },
  { key: 'user', header: __('User') },
  { key: 'group', header: __('EVM Group') },
];

/** Renders the icon for levelOne and levelTwo. */
const cellIcon = (type, name, reportTitle) => {
  const iconName = (type === reportTitle) ? ReportIcons.folderCloseBlue : ReportIcons.folderClose;
  return { text: name, icon: iconName };
};

/** Function to generate data needed for the level one folder list with 2 columns. */
const levelOne = (reportMenu, reportTitle) => {
  const headers = defaultHeaders;
  const rows = [];
  reportMenu.forEach((item, index) => {
    const nodeKey = `xx-${index}`;
    const obj = { id: index.toString(), nodeKey, clickable: true };
    const name = item[0].toString();
    headers.forEach((h) => {
      obj[h.key] = cellIcon(name, name, reportTitle);
    });
    rows.push(obj);
  });
  return { headers, rows };
};

/** Function to generate data needed for level two list with 2 columns. */
const levelTwo = (nodes, reportMenu, reportTitle) => {
  const headers = defaultHeaders;
  const rows = [];
  const nodeOne = parseInt(nodes[1]);
  reportMenu[nodeOne][1].forEach((item, index) => {
    const nodeKey = `xx-${nodeOne}_xx-${nodeOne}-${index}`;
    const obj = { id: index.toString(), nodeKey, clickable: true };
    const name = item[0].toString();
    headers.forEach((h) => {
      obj[h.key] = cellIcon(reportMenu[nodeOne][0], name, reportTitle);
    });
    obj.clickable = true;
    rows.push(obj);
  });
  return { headers, rows };
};

/** Function to generate data needed for the reports list with 8 columns. */
const levelFour = (nodes, reportMenu, reportDetails) => {
  const headers = [...defaultHeaders, ...additionalHeaders];
  const rows = [];
  const nodeOne = parseInt(nodes[1]);
  const nodeTwo = parseInt(nodes[2]);
  const nodeThree = parseInt(nodes[3]);
  reportMenu[nodeOne][1][nodeThree][1].forEach((item) => {
    const nodeId = reportDetails[item].id.toString();
    const nodeKey = `xx-${nodeOne}_xx-${nodeTwo}-${nodeThree}_rep-${nodeId}`;
    const obj = { id: nodeId, nodeKey, clickable: true };
    headers.forEach((h) => {
      switch (h.key) {
        case 'name':
        {
          obj[h.key] = { text: item, icon: ReportIcons.fileText };
          break;
        }
        case 'group':
        case 'user':
        {
          obj[h.key] = reportDetails[item][h.key];
          break;
        }
        default:
        {
          obj[h.key] = reportDetails[item][h.key] ? __('Yes') : __('No');
          break;
        }
      }
    });
    rows.push(obj);
  });
  return { headers, rows };
};

/** The data is generate for three types of tables based on nodes length. */
export const reportListData = (nodes, reportMenu, reportTitle, reportDetails) => {
  switch (nodes.length) {
    case 1:
      return levelOne(reportMenu, reportTitle);
    case 2:
      return levelTwo(nodes, reportMenu, reportTitle);
    case 4:
      return levelFour(nodes, reportMenu, reportDetails);
    default: return undefined;
  }
};

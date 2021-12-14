import textualSummaryGenericClick from '../../../react/textual_summary_click';

const DashboardTypes = {
  DASHBOARD: 'dashboard',
  GROUP: 'group',
  WIDGET: 'widget',
};

/** Function to return the key based on type and selected row */
const selectNodeKey = (type, selectedRow, nodes) => {
  switch (type) {
    case DashboardTypes.DASHBOARD: return selectedRow.id;
    case DashboardTypes.GROUP: return `xx-g_g-${selectedRow.id}`;
    case DashboardTypes.WIDGET: return `xx-g_g-${nodes[2]}_ws-${selectedRow.id}`;
    default: return '';
  }
};

/** Function to handle the onclick event for rows in table. */
export const onSelectRender = (type, selectedRow, activeTree, nodes, rows) => {
  miqSparkleOn();
  const tree = type === DashboardTypes.DASHBOARD ? activeTree : 'tree_select';
  const nodeKey = selectNodeKey(type, selectedRow, nodes);
  if (type === DashboardTypes.DASHBOARD) {
    miqTreeActivateNode(tree, nodeKey);
  } else {
    const rowItem = rows.find((item) => item.id === selectedRow.id);
    const link = `/report/${tree}?id=${nodeKey}&text=${rowItem.name || rowItem.description}`;
    textualSummaryGenericClick({ explorer: true, link });
  }
  miqSparkleOff();
};

const isDashboard = (nodes) => (nodes === null || nodes.length === 1);
const isGroup = (nodes) => nodes && nodes[nodes.length - 1] === 'g';
const isWidget = (nodes) => nodes.length === 3 && nodes[1] === 'g_g';

/** Function to generate the dashboard list data */
const dashboardList = (dashboards) => {
  const rows = Object.entries(dashboards).map(([key, value]) => ({ key, value }));
  const headers = [{ key: 'type', header: 'Type' }];
  rows.forEach((item) => {
    item.type = { text: item.value.text, icon: item.value.glyph };
    item.id = item.value.id;
    item.clickable = true;
  });
  return { headers, rows, type: DashboardTypes.DASHBOARD };
};

/** Function to generate the group list data */
const groupList = (groups) => {
  const headers = [{ key: 'description', header: 'Description' }];
  groups.forEach((item) => {
    item.id = item.id.toString();
    item.description = { text: item.description, icon: 'fa fa-lg ff ff-group' };
    item.clickable = true;
  });
  return { headers, rows: groups, type: DashboardTypes.GROUP };
};

/** Function to generate the widgets data */
const widgetList = (widgets) => {
  const headers = [{ key: 'description', header: 'Description' }];
  widgets.forEach((item) => {
    item.id = item.id.toString();
    item.description = { text: `${item.description} (${item.name})`, icon: 'fa fa-lg fa-dashboard' };
    item.clickable = true;
  });
  return { headers, rows: widgets, type: DashboardTypes.WIDGET };
};

/** Function to generate data for report dashboard */
export const tableData = (nodes, dashboards, groups, widgets) => {
  if (isDashboard(nodes)) return dashboardList(dashboards);
  if (isGroup(nodes)) return groupList(groups);
  if (isWidget(nodes)) return widgetList(widgets);
  return { headers: [], rows: [], type: '' };
};

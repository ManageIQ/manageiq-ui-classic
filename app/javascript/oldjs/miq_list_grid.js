/* global DoNav miqDomElementExists miqJqueryRequest miqSetButtons miqUpdateButtons */

// Handle row click (ajax or normal html trans)
window.miqRowClick = function(row_id, row_url, row_url_ajax) {
  if (!row_url) {
    return;
  }

  if (row_url_ajax) {
    miqJqueryRequest(row_url + row_id, { beforeSend: true, complete: true });
  } else {
    DoNav(row_url + row_id);
  }
};

window.checkboxItemId = function($elem) {
  const val = $elem.val();
  const name = $elem.attr('name');

  if (_.startsWith(name, 'check_')) {
    return name.substr(6);
  }

  return val;
};

// returns a list of checked row ids
window.miqGridGetCheckedRows = function(grid) {
  grid = grid || 'list_grid';
  const crows = [];

  $(`#${grid} .list-grid-checkbox`).each((_idx, elem) => {
    if (!$(elem).prop('checked')) {
      return;
    }

    const item_id = checkboxItemId($(elem));
    crows.push(item_id);
  });

  return crows;
};

// checks/unchecks all grid rows
window.miqGridCheckAll = function(state, grid) {
  grid = grid || 'list_grid';
  state = !!state;

  $(`#${grid} .list-grid-checkbox`)
    .prop('checked', state)
    .trigger('change');
};

// Order a service from the catalog list view
window.miqOrderService = function(id) {
  const url = `/${ManageIQ.controller}/x_button/${id}?pressed=svc_catalog_provision`;
  miqJqueryRequest(url, { beforeSend: true, complete: true });
};

window.miqQueueReport = function(id) {
  const url = `/optimization/queue_report/${id}`;
  window.miqSparkleOn();
  http
    .post(url, {})
    .then((data) => {
      window.add_flash(data.flash, 'success');
      window.miqSparkleOff();
    })
    .catch(() => window.miqSparkleOff());
};

// Handle checkbox
window.miqGridOnCheck = function(elem, button_div, grid) {
  if (elem) {
    miqUpdateButtons(elem, button_div);
  }

  const crows = miqGridGetCheckedRows(grid);
  ManageIQ.gridChecks = crows;

  miqSetButtons(crows.length, 'center_tb');
};

// Handle sort
window.miqGetSortUrl = function(col_id) {
  let controller = null;
  const action = ManageIQ.actionUrl;
  let id = null;

  if (action === 'sort_ds_grid') {
    controller = 'miq_request';
  } else if (ManageIQ.record.parentId !== null) {
    controller = ManageIQ.record.parentClass;
    id = ManageIQ.record.parentId;
  }

  let url = action;
  if (controller) {
    url = `/${controller}/${url}`;
  }
  if (id && (url.indexOf(id) < 0)) {
    url = `${url}/${id}`;
  }

  url = `${url}?sortby=${col_id}&${window.location.search.substring(1)}`;
  return url;
};

window.miqGridSort = function(col_id) {
  const url = miqGetSortUrl(col_id);
  miqJqueryRequest(url, { beforeSend: true, complete: true });
};

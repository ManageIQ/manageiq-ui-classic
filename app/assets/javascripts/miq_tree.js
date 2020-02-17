/* global DoNav miqClearTreeState miqDomElementExists miqJqueryRequest miqSetToolbarCount miqSparkle */


function isReduxTree(treeName) {
  var store = ManageIQ.redux.store.getState();
  return store.hasOwnProperty(treeName);
}

function miqTreeObject(tree) {
  var obj;
  try {
    obj = $('#' + tree + 'box').treeview(true);
  } catch (_ex) {
    obj = $('miq-tree-view[name="' + tree + '"] > .treeview').treeview(true);
  } finally {
    return obj;
  }
}

window.miqTreeFindNodeByKey = function(tree, key) {
  var tree = miqTreeObject(tree);

  if (!tree) {
    console.error("miqTreeFindNodeByKey: tree '" + tree + "' does not exist.");
    return;
  }

  return tree.getNodes().find(function(node) {
    return (node.key === key);
  });
}

function miqAddNodeChildren(treename, key, selected_node, children) {
  var node = miqTreeFindNodeByKey(treename, key);
  if (node.lazyLoad) {
    node.lazyLoad = false;
  }
  miqTreeObject(treename).addNode(children, node);
  miqTreeActivateNodeSilently(treename, selected_node);
}

function miqTreeResetState(treename) {
  // FIXME: this is probably not enough, keeping the original dynatree code in comments for the future
  miqTreeClearState(treename);
  /*
  var key = 'treeOpenStatex' + treename ;
  delete localStorage[key + '-active'];
  delete localStorage[key + '-expand'];
  delete localStorage[key + '-focus'];
  delete localStorage[key + '-select'];
  */
}

function miqRemoveNodeChildren(treename, key) {
  var node = miqTreeFindNodeByKey(treename, key);
  if (node.nodes) {
    node.nodes.slice().forEach(function(child) {
      miqTreeObject(treename).removeNode(child);
    });
  }
}

function miqTreeSelect(key) {
  var url = '/' + ManageIQ.controller + '/tree_select/?id=' + encodeURIComponent(key.split('__')[0]);
  miqJqueryRequest(url, {beforeSend: true});
}

// Activate and focus on a node within a tree given the node's key
function miqTreeActivateNode(tree, key) {
  miqSparkle(true);
  if (isReduxTree(tree)) {
    ManageIQ.redux.store.dispatch({namespace: tree, type: '@@tree/selectNode', key: key});
    ManageIQ.redux.store.dispatch({namespace: tree, type: '@@tree/expandNode', key: key});
    ManageIQ.redux.store.dispatch({namespace: tree, type: '@@tree/scrollToNode', key: key});
  } else {
    var node = miqTreeFindNodeByKey(tree, key);
    if (node) {
      miqTreeObject(tree).selectNode(node);
      miqTreeScrollToNode(tree, key);
    }
  }
}

// Activate silently (no onActivate event) and focus on a node within a tree given the node's key
function miqTreeActivateNodeSilently(tree, key) {
  if (isReduxTree(tree)) {
    ManageIQ.redux.store.dispatch({namespace: tree, type: '@@tree/selectNodeSilent', key: key});
    ManageIQ.redux.store.dispatch({namespace: tree, type: '@@tree/expandNode', key: key});
    ManageIQ.redux.store.dispatch({namespace: tree, type: '@@tree/scrollToNode', key: key});
  } else {
    var node = miqTreeFindNodeByKey(tree, key);
    if (node) {
      miqTreeObject(tree).selectNode(node, {silent: true });
      miqTreeObject(tree).expandNode(node);
      miqTreeScrollToNode(tree, key);
    }
  }
}

// Activate a node silently and fire the activation event manually
function miqTreeForceActivateNode(tree, key) {
  miqTreeActivateNodeSilently(tree, key);
  miqTreeObject(tree).options.onNodeSelected(0, miqTreeFindNodeByKey(tree, key));
}

// expand all parent nodes of selected node on initial load
function miqExpandParentNodes(treename, selected_node) {
  var node = miqTreeFindNodeByKey(treename, selected_node);
  if (node) {
    miqTreeObject(treename).revealNode(node, {silent: true});
  }
}

function miqTreeScrollToNode(tree, id) {
  var node = miqTreeFindNodeByKey(tree, id);
  var parentPanelBody = node.$el.parents('div.panel-body');
  if (parentPanelBody.length > 0) {
    // Calculate the current node position relative to the scrollable panel
    var nodePos = node.$el.offset().top - parentPanelBody.offset().top;

    var offset = 0; // Calculate the required scrolling offset
    if (nodePos < 0) {
      offset = nodePos - node.$el.height();
    } else if (nodePos > parentPanelBody.height()) {
      offset = nodePos + node.$el.height() - parentPanelBody.height();
    }

    if (offset != 0) { // Scroll the panel to the node's position if necessary
      parentPanelBody.animate({scrollTop: parentPanelBody.scrollTop() + offset});
    }
  }
}

// delete specific tree cookies
function miqDeleteTreeCookies(tree_prefix) {
  miqTreeClearState(tree_prefix);
}

// toggle expand/collapse all nodes in tree
function miqTreeToggleExpand(treename, expand_mode) {
  if (isReduxTree(treename)) {
    ManageIQ.redux.store.dispatch({namespace: treename, type: '@@tree/expandAll', value: expand_mode});
  } else {
    expand_mode ? miqTreeObject(treename).expandAll() : miqTreeObject(treename).collapseAll();
  }
}

/**
 * Function for the react tree to select checked keys.
 * @param  {Object} tree  The tree object itself.
 * @return {Array}        Array of keys.
 */
function miqGetSelectedKeys(tree) {
  return Object.values(tree).filter(function(entry) {
    return (entry.state && entry.state.checked);
  }).map(function(entry) {
    return entry.attr.key;
  });
}

// Generic OnCheck handler for the checkboxes in tree
function miqOnCheckGeneric(key, checked) {
  miqJqueryRequest(ManageIQ.tree.checkUrl + encodeURIComponent(key) + '?check=' + (checked ? '1' : '0'));
}

// OnCheck handler for the belongs to drift/compare sections tree
function miqOnCheckSections(key, checked, tree) {
  var selectedKeys = miqGetSelectedKeys(tree);

  var url = ManageIQ.tree.checkUrl + '?id=' + encodeURIComponent(key) + '&check=' + checked;
  miqJqueryRequest(url, {data: {all_checked: selectedKeys}});
  return true;
}

function miqOnCheckGenealogy(key, checked, tree) {
  var selectedKeys = getSelectedKeys(tree);

  // Activate toolbar items according to the selection
  miqSetToolbarCount(selectedKeys.length);
  // Inform the backend about the checkbox changes
  miqJqueryRequest(ManageIQ.tree.checkUrl + '?all_checked=' + selectedKeys, {beforeSend: true, complete: true});
}

function miqOnCheckTenantTree(node) {
  var url = ManageIQ.tree.checkUrl + encodeURIComponent(node.key) + '?check=' + (node.state.checked ? '1' : '0');
  sendDataWithRx({
    controller: 'catalogItemFormController',
    key: node.key,
  })
}

function miqCheckAll(cb, treeName) {
  // Set the checkboxes according to the master checkbox
  ManageIQ.redux.store.dispatch({namespace: treeName, type: '@@tree/checkAll', value: cb.checked});

  // Map the selected nodes into an array of keys
  var selectedKeys = [];
  var tree = ManageIQ.redux.store.getState()[treeName];

  for (var property in tree) {
    if (tree.hasOwnProperty(property) && property !== '') {
      selectedKeys.push(encodeURIComponent(tree[property].attr.key));
    }
  }

  // Activate toolbar items according to the selection
  miqSetToolbarCount(selectedKeys.length);
  // Inform the backend about the checkbox changes
  miqJqueryRequest(ManageIQ.tree.checkUrl + '?check_all=' + encodeURIComponent(cb.checked) + '&all_checked=' + selectedKeys);
}

// Generic OnClick handler for selecting nodes in tree
function miqOnClickGeneric(id) {
  miqJqueryRequest(ManageIQ.tree.clickUrl + encodeURIComponent(id), {beforeSend: true, complete: true});
}

// Settings -> Diagnostics -> Roles By servers tab
function miqOnClickDiagnostics(id) {
  var typ = id.split('-')[0]; // Break apart the node ids
  if (['svr', 'role', 'asr'].includes(typ)) {
    miqJqueryRequest(ManageIQ.tree.clickUrl + '?id=' + encodeURIComponent(id), {beforeSend: true, complete: true});
  }
}

// Compute -> Infra -> VMs -> Select one -> Snapshot button
function miqOnClickSnapshots(id) {
  var pieces = id.split(/-/);
  var shortId = pieces[pieces.length - 1];
  miqJqueryRequest('/' + ManageIQ.controller + '/snap_pressed/' + encodeURIComponent(shortId), {beforeSend: true, complete: true});
}

// OnClick handler for Host Network Tree
function miqOnClickHostNet(id) {
  var ids = id.split('|')[0].split('_'); // Break apart the node ids
  var nid = ids[ids.length - 1].split('-'); // Get the last part of the node id
  DoNav('/vm_or_template/show/' + encodeURIComponent(nid[1]));
}

function miqOnClickSelectRbacTreeNode(id) {
  var tree = 'rbac_tree';
  miqJqueryRequest('/' + ManageIQ.controller + '/tree_select/?id=' + encodeURIComponent(id) + '&tree=' + tree, {beforeSend: true});
  miqTreeScrollToNode(tree, id);
}

function miqOnClickMenuRoles(id) {
  var url = ManageIQ.tree.clickUrl + '?node_id=' + encodeURIComponent(id) + '&node_clicked=1';
  miqJqueryRequest(url, {
    beforeSend: true,
    complete: true,
    no_encoding: true,
  });
}

// Automate -> Expoler -> Select a class -> Copy -> Uncheck Copy to same path -> Namespace selection uses thath tree
function miqOnClickAutomate(id) {
  miqJqueryRequest('/' + ManageIQ.controller + '/ae_tree_select/?id=' + encodeURIComponent(id) + '&tree=automate_tree');
}

// Services -> Catalogs -> Catalog Items -> add a new item -> select Generic -> three entry point fields open it.
function miqOnClickAutomateCatalog(id) {
  miqJqueryRequest('/' + ManageIQ.controller + '/ae_tree_select/?id=' + encodeURIComponent(id) + '&tree=automate_catalog_tree');
}

function miqOnClickIncludeDomainPrefix() {
  miqJqueryRequest('/' + ManageIQ.controller + '/ae_tree_select_toggle?button=domain');
}

function miqTreeExpandNode(treename, key) {
  if (isReduxTree(treename)) {
    ManageIQ.redux.store.dispatch({namespace: treename, type: '@@tree/expandNode', key: key});
  } else {
    var node = miqTreeFindNodeByKey(treename, key);
    miqTreeObject(treename).expandNode(node);
  }
}

function miqTreeExpandRecursive(treeId, fullNodeId) {
  var currId = '';
  var indexOfBox = treeId.indexOf('box');
  var splitNodeId = fullNodeId.split('_');
  if (indexOfBox !== -1 && treeId.length - 3 === indexOfBox) {
    treeId = treeId.substring(0, indexOfBox);
  }
  splitNodeId.forEach(function(item, key) {
    if (key + 1 !== splitNodeId.length) {
      if (key !== 0) {
        currId += '_' + item;
      } else {
        currId = item;
      }
      miqTreeExpandNode(treeId, currId);
    }
  });
}

function miqMenuChangeRow(action, elem) {
  var grid = $('#folder_grid .panel-group');
  var selected = grid.find('.panel-heading.active').parent();

  switch (action) {
    case 'activate':
      grid.find('.panel-heading.active').removeClass('active');
      $(elem).addClass('active');
      break;

    case 'edit':
      // quick and dirty edit - FIXME use a $modal when converted to angular
      var text = $(elem).text().trim();
      text = prompt(__('New name?'), text);
      if (text) {
        $(elem).text(text);
      }
      break;

    case 'up':
      selected.prev().before(selected);
      break;
    case 'down':
      selected.next().after(selected);
      break;

    case 'top':
      selected.siblings().first().before(selected);
      break;
    case 'bottom':
      selected.siblings().last().after(selected);
      break;

    case 'add':
      var count = grid.find('.panel-heading').length;

      elem = $('<div>').addClass('panel-heading');
      elem.attr('id', 'folder' + count);
      elem.text(__('New Folder'));
      elem.on('click', function() {
        return miqMenuChangeRow('activate', this);
      });
      elem.on('dblclick', function() {
        return miqMenuChangeRow('edit', this);
      });

      grid.append(elem);

      miqMenuChangeRow('activate', elem);

      // just shows a flash message
      miqJqueryRequest('/report/menu_folder_message_display?typ=add', {no_encoding: true});
      break;

    case 'delete':
      if (!selected.length) {
        break;
      }

      var selected_id = selected.children()[0].id.split('|-|');
      if (selected_id.length === 1) {
        selected.remove();
      } else {
        // just show a flash message
        miqJqueryRequest('/report/menu_folder_message_display?typ=delete');
      }
      break;

    case 'serialize':
      var items = grid.find('.panel-heading').toArray().map(function(elem) {
        return {
          id: $(elem).attr('id'),
          text: $(elem).text().trim(),
        };
      });
      var serialized = JSON.stringify(items);

      var url = '/report/menu_field_changed/?tree=' + encodeURIComponent(serialized);
      miqJqueryRequest(url, {beforeSend: true, complete: true, no_encoding: true});
      break;
  }

  return false;
}

function miqSquashToggle(treeName) {
  if (ManageIQ.tree.expandAll) {
    $('#squash_button i').attr('class', 'fa fa-minus-square-o fa-lg');
    $('#squash_button').prop('title', __('Collapse All'));
    miqTreeToggleExpand(treeName, true);
    ManageIQ.tree.expandAll = false;
  } else {
    $('#squash_button i').attr('class', 'fa fa-plus-square-o fa-lg');
    $('#squash_button').prop('title', __('Expand All'));
    miqTreeToggleExpand(treeName, false);
    ManageIQ.tree.expandAll = true;
  }
}

function miqTreeEventSafeEval(func) {
  var whitelist = [
    'miqOnCheckGenealogy', // Compute -> Infrastructure -> VMs -> Select one vm and click on genealogy
    'miqOnCheckGeneric',
    'miqOnCheckSections', // Compute -> Infra -> VMs -> Compare VM's
    'miqOnCheckTenantTree', // Services -> Catalogs -> Catalog Items -> Edit item -> Tenants tree
    'miqOnClickAutomate', // Automate -> Expoler -> Select a class -> Copy -> Uncheck Copy to same path -> Namespace selection uses thath tree
    'miqOnClickAutomateCatalog', // Services -> Catalogs -> Catalog Items -> add a new item -> select Generic -> three entry point fields open it.
    'miqOnClickDiagnostics', // Settings -> Diagnostics -> Roles By servers tab
    'miqOnClickGeneric', // Compute -> Infrastructure -> VMs -> Select one vm and click on genealogy
    'miqOnClickHostNet', // Compute -> Infra -> Networking // Still old tree
    'miqOnClickMenuRoles', // Settings -> Access Controll -> Roles/Edit Roles // Seems like not doing anything
    'miqOnClickSnapshots', // Compute -> Infra -> VMs -> Select one -> Snapshot button
  ];

  if (whitelist.includes(func)) {
    return window[func];
  }
  throw new Error('Function not in whitelist: ' + func);
}

function miqTreeOnNodeChecked(options, node) {
  if (options.oncheck) {
    miqTreeEventSafeEval(options.oncheck)(node, options.tree_name);
  }
}

function miqTreeState(tree, node, state) {
  // Initialize the session storage object
  var persist = JSON.parse(sessionStorage.getItem('tree_state_' + tree));
  if (!persist) {
    persist = {};
  }

  if (state === undefined) {
    // No third argument, return the stored value or undefined
    return persist[node];
  }
  // Save the third argument as the new node state
  persist[node] = state;
  sessionStorage.setItem('tree_state_' + tree, JSON.stringify(persist));
}

function miqTreeClearState(tree) {
  if (tree === undefined) {
    // Clear all tree state objects
    var to_remove = [];
    for (var i = 0; i < sessionStorage.length; i++) {
      if (sessionStorage.key(i).match('^tree_state_')) {
        to_remove.push(sessionStorage.key(i));
      }
    }
    for (var i = 0; i < to_remove.length; i++) {
      sessionStorage.removeItem(to_remove[i]);
    }
  } else {
    // Clear the state of one specific tree
    sessionStorage.removeItem('tree_state_' + tree);
  }
}

window.miqInitTree = function(options, tree) {
  if (options.check_url) {
    ManageIQ.tree.checkUrl = options.check_url;
  }

  if (options.click_url) {
    ManageIQ.tree.clickUrl = options.click_url;
  }

  if (options.group_changed) {
    miqDeleteTreeCookies();
  }

  $('#' + options.tree_id).treeview({
    data: tree,
    showImage: true,
    preventUnselect: true,
    showCheckbox: options.checkboxes,
    hierarchicalCheck: options.hierarchical_check,
    highlightChanges: options.highlight_changes,
    levels: 1,
    allowReselect: options.allow_reselect,
    expandIcon: 'fa fa-fw fa-angle-right',
    collapseIcon: 'fa fa-fw fa-angle-down',
    loadingIcon: 'fa fa-fw fa-spinner fa-pulse',
    checkedIcon: 'fa fa-fw fa-check-square-o',
    uncheckedIcon: 'fa fa-fw fa-square-o',
    partiallyCheckedIcon: 'fa fa-fw fa-check-square',
    checkboxFirst: true,
    showBorders: false,
    onNodeSelected: function(event, node) {
      if (options.onclick) {
        if (options.click_url) {
          miqTreeEventSafeEval(options.onclick)(node.key);
        } else if (miqCheckForChanges() === false) {
          node.$el.focus();
        } else {
          miqTreeEventSafeEval(options.onclick)(node.key);
        }
      }
    },
    onNodeChecked: function(event, node) {
      miqTreeOnNodeChecked(options, node);
    },
    onNodeUnchecked: function(event, node) {
      miqTreeOnNodeChecked(options, node);
    },
    onNodeExpanded: function(event, node) {
      miqTreeState(options.tree_name, node.key, true);
    },
    onNodeCollapsed: function(event, node) {
      miqTreeState(options.tree_name, node.key, false);
    },
    lazyLoad: function(node, display) {
      if (options.autoload) {
        $.ajax({
          url: '/' + options.controller + '/tree_autoload',
          type: 'post',
          data: {
            id: node.key,
            tree: options.tree_name,
            mode: 'all',
          },
        }).success(display).error(function(data) {
          console.log(data);
        });
      }
    },
  });

  if (options.silent_activate) {
    miqExpandParentNodes(options.tree_name, options.select_node);
    miqTreeActivateNodeSilently(options.tree_name, options.select_node);
  }

  // Tree state persistence correction after the tree is completely loaded
  miqTreeObject(options.tree_name).getNodes().forEach(function(node) {
    if (miqTreeState(options.tree_name, node.key) === !node.state.expanded) {
      miqTreeObject(options.tree_name).toggleNodeExpanded(node);
    }
  });
}

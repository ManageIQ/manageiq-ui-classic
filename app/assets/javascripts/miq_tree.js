/* global DoNav miqClearTreeState miqDomElementExists miqJqueryRequest miqSetButtons miqSparkle */

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

function miqTreeFindNodeByKey(tree, key) {
  var tree = miqTreeObject(tree);

  if (! tree) {
    console.error("miqTreeFindNodeByKey: tree '" + tree + "' does not exist.");
    return;
  }

  return tree.getNodes().find(function(node) {
    return (node.key === key);
  });
}

// Generic OnCheck handler for the checkboxes in tree
function miqOnCheckGeneric(node) {
  var url = ManageIQ.tree.checkUrl + encodeURIComponent(node.key) + '?check=' + (node.state.checked ? '1' : '0');
  miqJqueryRequest(url);
}

// Generic OnClick handler for selecting nodes in tree
function miqOnClickGeneric(id) {
  miqJqueryRequest(ManageIQ.tree.clickUrl + encodeURIComponent(id), {beforeSend: true, complete: true});
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

function miqOnCheckMenuRoles(id) {
  var nid = id.split('__');
  if (nid[0] !== 'r') {
    var url = ManageIQ.tree.clickUrl + '?node_id=' + encodeURIComponent(id) + '&node_clicked=1';
    miqJqueryRequest(url, {beforeSend: true,
      complete: true,
      no_encoding: true,
    });
  }
}

// OnClick handler to run tree_select server method
function miqOnClickSelectTreeNode(id) {
  var rec_id = id.split('__');
  var url = '/' + ManageIQ.controller + '/tree_select/?id=' + encodeURIComponent(rec_id[0]);
  miqJqueryRequest(url, {beforeSend: true});
}

// Activate and focus on a node within a tree given the node's key
function miqTreeActivateNode(tree, key) {
  miqSparkle(true);
  var node = miqTreeFindNodeByKey(tree, key);
  if (node) {
    miqTreeObject(tree).selectNode(node);
    node.$el.focus();
  }
}

// Activate silently (no onActivate event) and focus on a node within a tree given the node's key
function miqTreeActivateNodeSilently(tree, key) {
  var node = miqTreeFindNodeByKey(tree, key);
  if (node) {
    miqTreeObject(tree).selectNode(node, {silent: true });
    miqTreeObject(tree).expandNode(node);
    node.$el.focus();
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

// OnCheck handler for the tags trees
function miqOnCheckProvTags(node, treename) {
  var tree = miqTreeObject(treename);
  // Allow only one node among siblings to be checked
  if (node.state.checked) {
    var siblings = $.grep(tree.getParents(node)[0].nodes, function(item) {
      return item.key !== node.key;
    });
    tree.uncheckNode(siblings, {silent: true });
  }

  var all_checked = tree.getChecked().map(function(item) {
    return encodeURIComponent(item.key);
  });

  miqJqueryRequest(ManageIQ.tree.checkUrl + '?ids_checked=' + all_checked);
  return true;
}

function miqOnClickSelectRbacTreeNode(id) {
  var tree = 'rbac_tree';
  miqTreeExpandNode(tree, 'xx-' + id.split('-')[0]);
  miqJqueryRequest('/' + ManageIQ.controller + '/tree_select/?id=' + encodeURIComponent(id) + '&tree=' + tree, {beforeSend: true});
  miqTreeScrollToNode(tree, id);
}

function miqTreeScrollToNode(tree, id) {
  var node = miqTreeFindNodeByKey(tree, id);
  var parentPanelBody = node.$el.parents('div.panel-body');
  parentPanelBody.animate({scrollTop: (parentPanelBody.position().top + node.$el.position().top)});
}

function miqOnClickAutomate(id) {
  miqTreeExpandNode('automate_tree', id);
  miqJqueryRequest('/' + ManageIQ.controller + '/ae_tree_select/?id=' + encodeURIComponent(id) + '&tree=automate_tree');
}

function miqOnClickIncludeDomainPrefix() {
  miqJqueryRequest('/' + ManageIQ.controller + '/ae_tree_select_toggle?button=domain');
}

// delete specific tree cookies
function miqDeleteTreeCookies(tree_prefix) {
  miqTreeClearState(tree_prefix);
}

// toggle expand/collapse all nodes in tree
function miqTreeToggleExpand(treename, expand_mode) {
  expand_mode ? miqTreeObject(treename).expandAll() : miqTreeObject(treename).collapseAll();
}

// OnCheck handler for the Protect screen
function miqOnCheckProtect(node, _treename) {
  var ppid = node.key.split('_').pop();
  var url = ManageIQ.tree.checkUrl + encodeURIComponent(ppid) + '?check=' + Number(node.state.checked);
  miqJqueryRequest(url);
  return true;
}

// OnClick handler for the VM Snapshot Tree
function miqOnClickSnapshots(id) {
  var pieces = id.split(/-/);
  var shortId = pieces[pieces.length - 1];
  miqJqueryRequest('/' + ManageIQ.controller + '/snap_pressed/' + encodeURIComponent(shortId), {beforeSend: true, complete: true});
}

// OnClick handler for Host Network Tree
function miqOnClickHostNet(id) {
  var ids = id.split('|')[0].split('_'); // Break apart the node ids
  var nid = ids[ids.length - 1].split('-'); // Get the last part of the node id
  switch (nid[0]) {
    case 'v':
      DoNav('/vm/show/' + encodeURIComponent(nid[1]));
      break;
    case 'h':
      DoNav('/host/show/' + encodeURIComponent(nid[1]));
      break;
    case 'c':
      DoNav('/ems_cluster/show/' + encodeURIComponent(nid[1]));
      break;
    case 'rp':
      DoNav('/resource_pool/show/' + encodeURIComponent(nid[1]));
      break;
    default:
      break;
  }
}

// OnCheck handler for the belongs to drift/compare sections tree
function miqOnCheckSections(_tree_name, key, checked, all_checked) {
  var url = ManageIQ.tree.checkUrl + '?id=' + encodeURIComponent(key) + '&check=' + checked;
  miqJqueryRequest(url, {data: {all_checked: all_checked}});
  return true;
}

function miqOnCheckGenealogy(node, treename) {
  var count = 0;
  var tree = miqTreeObject(treename);
  // Map the selected nodes into an array of keys
  var selectedKeys = tree.getChecked().map(function(item) {
    return encodeURIComponent(item.key);
  });
  // Activate toolbar items according to the selection
  miqSetButtons(selectedKeys.length, 'center_tb');
  // Inform the backend about the checkbox changes
  miqJqueryRequest(ManageIQ.tree.checkUrl + '?all_checked=' + selectedKeys, {beforeSend: true, complete: true});
}

function miqCheckAll(cb, treename) {
  var tree = miqTreeObject(treename);
  // Set the checkboxes according to the master checkbox
  if (cb.checked) {
    tree.checkAll({silent: true});
  } else {
    tree.uncheckAll({silent: true});
  }
  // Map the selected nodes into an array of keys
  var selectedKeys = tree.getChecked().map(function(item) {
    return encodeURIComponent(item.key);
  });
  // Activate toolbar items according to the selection
  miqSetButtons(selectedKeys.length, 'center_tb');
  // Inform the backend about the checkbox changes
  miqJqueryRequest(ManageIQ.tree.checkUrl + '?check_all=' + encodeURIComponent(cb.checked) + '&all_checked=' + selectedKeys);
}

function miqTreeExpandNode(treename, key) {
  var node = miqTreeFindNodeByKey(treename, key);
  miqTreeObject(treename).expandNode(node);
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

// OnClick handler for Server Roles Tree
function miqOnClickDiagnostics(id) {
  var typ = id.split('-')[0]; // Break apart the node ids
  switch (typ) {
    case 'svr':
    case 'role':
    case 'asr':
      miqJqueryRequest(ManageIQ.tree.clickUrl + '?id=' + encodeURIComponent(id), {beforeSend: true, complete: true});
      break;
  }
}

// OnCheck handler for the belongsto tagging trees on the user edit screen
function miqOnCheckUserFilters(node, tree_name) {
  var tree_typ = tree_name.split('_')[0];
  var checked = Number(node.state.checked);
  var url = ManageIQ.tree.checkUrl + encodeURIComponent(node.key) + '?check=' + checked + '&tree_typ=' + encodeURIComponent(tree_typ);
  miqJqueryRequest(url);
  return true;
}

// OnCheck handler for Check All checkbox on C&U collection trees
function miqCheckCUAll(cb, treename) {
  cb.checked ? miqTreeObject(treename).checkAll({silent: true}) : miqTreeObject(treename).uncheckAll({silent: true});
  var url = ManageIQ.tree.checkUrl + '?check_all=' + encodeURIComponent(cb.checked) + '&tree_name=' + encodeURIComponent(treename);
  miqJqueryRequest(url);
}

// OnCheck handler for the C&U collection trees
function miqOnCheckCUFilters(tree_name, key, checked) {
  var url = ManageIQ.tree.checkUrl + '?id=' + encodeURIComponent(key) + '&check=' + encodeURIComponent(checked) + '&tree_name=' + encodeURIComponent(tree_name);
  miqJqueryRequest(url);
  return true;
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
      if (! selected.length) {
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
    'miqOnCheckCUFilters',
    'miqOnCheckGenealogy',
    'miqOnCheckGeneric',
    'miqOnCheckMenuRoles',
    'miqOnCheckProtect',
    'miqOnCheckProvTags',
    'miqOnCheckSections',
    'miqOnCheckUserFilters',
    'miqOnClickAutomate',
    'miqOnClickDiagnostics',
    'miqOnClickGeneric',
    'miqOnClickHostNet',
    'miqOnClickSelectTreeNode',
    'miqOnClickSnapshots',
    'miqOnClickUtilization',
  ];

  if (whitelist.includes(func)) {
    return window[func];
  }
  throw new Error('Function not in whitelist: ' + func);
}

function miqTreeOnNodeChecked(options, node) {
  if (options.oncheck) {
    miqTreeEventSafeEval(options.oncheck)(node, options.tree_name);
  } else if (options.onselect) {
    var selectedKeys = miqTreeObject(options.tree_name).getChecked().map(function(node) {
      return node.key;
    });
    miqTreeEventSafeEval(options.onselect)(options.tree_name, node.key, node.state.checked, selectedKeys);
  }
}

function miqTreeState(tree, node, state) {
  // Initialize the session storage object
  var persist = JSON.parse(sessionStorage.getItem('tree_state_' + tree));
  if (! persist) {
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

function miqInitTree(options, tree) {
  if (options.check_url) {
    ManageIQ.tree.checkUrl = options.check_url;
  }

  if (options.click_url) {
    ManageIQ.tree.clickUrl = options.click_url;
  }

  if (options.group_changed) {
    miqDeleteTreeCookies();
  }

  // Pre-process partially checkbox state for parent nodes
  if (options.post_check && options.hierarchical_check) {
    var nodes = [];
    var parents = [];
    var stack = tree.slice(0);

    // Collect nodes
    while (stack.length > 0) {
      var node = stack.pop();
      nodes.push(node);

      if (node.nodes) {
        parents.push(node);
        node.nodes.forEach(function(child) {
          stack.push(child);
        });
      }
    }


    // Process nodes top-to-bottom
    nodes.reverse();
    while (nodes.length > 0) {
      var parent = nodes.pop();
      if (! parent.nodes) {
        continue;
      }
      if (! parent.state) {
        parent.state = {};
      }
      parent.nodes.forEach(function(node) {
        if (parent.state.checked === true) {
          if (! node.state) {
            node.state = {};
          }
          node.state.checked = true;
        }
      });
    }

    // Process nodes bottom-to-top
    while (parents.length > 0) {
      var node = parents.pop();
      node.state.checked = node.nodes.map(function(node) {
        return node.state ? node.state.checked : false;
      }).reduce(function(acc, curr) {
        return (acc === curr) ? acc : 'undefined';
      });
    }
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
      miqTreeState(options.cookie_id, node.key, true);
    },
    onNodeCollapsed: function(event, node) {
      miqTreeState(options.cookie_id, node.key, false);
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
    if (miqTreeState(options.cookie_id, node.key) === ! node.state.expanded) {
      miqTreeObject(options.tree_name).toggleNodeExpanded(node);
    }
  });
}

/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import {
  Db2Database20, BareMetalServer20,
} from '@carbon/icons-react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import createSchema from './settings-cu-collection-tab.schema';

let idCounter = 0;
let modified = false;

const SettingsCUCollectionTab = ({
  url, fetchURL, clusterTree, datastoreTree, allClusters, allDatastores,
}) => {
  const [data, setData] = useState({
    isLoading: false,
    tempData: undefined,
    clustersNodes: [],
    datastoresNodes: [],
    hostsCheckedWithId: [],
    datastoresCheckedWithId: [],
    callNumber: 0,
  });

  const customValidation = (values) => {
    if (values.tree_dropdown === undefined) {
      values.tree_dropdown = data.checked || [];
    }
    if (values) {
      if (JSON.stringify(values.clusters_tree) === JSON.stringify(data.hostsCheckedWithId)
        && JSON.stringify(values.datastores_tree) === JSON.stringify(data.datastoresCheckedWithId)
        && values.all_clusters === allClusters
        && values.all_datastores === allDatastores) {
        modified = false;
      } else {
        modified = true;
      }
    }
  };

  const generateId = () => idCounter++;

  const parseLabel = (text) => {
    const parts = text.match(/<strong>(.*?)<\/strong>(.*)/);

    if (parts) {
      return (
        <span>
          <strong>{parts[1]}</strong>
          {parts[2]}
        </span>
      );
    }
    return <span>{text}</span>;
  };

  const transformTree = (node, isDatastore, depth) => {
    const currentId = generateId();

    const nodeObject = {
      value: `${node.key}#${currentId}`,
      label: <span className="dropdown-label">
        {parseLabel(node.text)}
      </span>,
      showCheckbox: !isDatastore || node.nodes !== undefined || depth === 0,
      disabled: !isDatastore && !node.nodes && depth === 0,
    };

    let icon;
    switch (node.icon) {
      case 'fa fa-database':
        icon = <Db2Database20 color="black" />;
        break;

      case 'pficon pficon-cluster':
        icon = <BareMetalServer20 color="black" />;
        break;
      default:
        break;
    }

    if (node.image) {
      icon = <img src={node.image} alt="node" />;
    }
    if (icon) {
      nodeObject.icon = <span>{ icon }</span>;
    }

    if (node.nodes) {
      nodeObject.children = node.nodes.map((node) => transformTree(node, isDatastore, depth + 1));
    }
    return nodeObject;
  };

  const getNodeValues = () => {
    let clustersNodes = [];
    let datastoresNodes = [];
    idCounter = 0;
    if (clusterTree) {
      const clustersBsTree = JSON.parse(clusterTree.bs_tree);
      clustersNodes = clustersBsTree.map((node) => transformTree(node, false, 0));
    }
    if (datastoreTree) {
      const datastoresBsTree = JSON.parse(datastoreTree.bs_tree);
      datastoresNodes = datastoresBsTree.map((node) => transformTree(node, true, 0));
    }

    http.get(fetchURL).then((result) => {
      const { hosts, datastores } = result;
      const hostsChecked = [];
      const hostsCheckedWithId = [];
      const datastoresChecked = [];
      const datastoresCheckedWithId = [];
      for (const host of hosts) {
        if (host.capture === true) {
          hostsChecked.push(`h-${host.id}`);
        }
      }
      for (const datastore of datastores) {
        if (datastore.capture === true) {
          datastoresChecked.push(`ds-${datastore.id}`);
        }
      }

      for (const node of clustersNodes) {
        if (node.children) {
          for (const host of node.children) {
            if (hostsChecked.includes(host.value.split('#')[0])) {
              hostsCheckedWithId.push(host.value);
            }
          }
        }
      }

      for (const node of datastoresNodes) {
        if (node.children) {
          const dsValue = node.value.split('#')[0];
          const dsId = dsValue.split('-')[1];
          const foundObject = datastores.find((item) => item.id === Number(dsId));
          if (datastoresChecked.includes(dsValue) && foundObject.capture === true) {
            for (const host of node.children) {
              datastoresCheckedWithId.push(host.value);
            }
          }
        } else if (datastoresChecked.includes(node.value.split('#')[0])) {
          datastoresCheckedWithId.push(node.value);
        }
      }

      setData({
        ...data,
        clustersNodes,
        datastoresNodes,
        hostsCheckedWithId,
        datastoresCheckedWithId,
        callNumber: data.callNumber + 1,
      });
    });
  };

  useEffect(() => {
    if (data.isLoading) {
      http.post(url, data.tempData)
        .then(() => {
          setData({
            ...data,
            isLoading: false,
          });
          window.location.reload();
        })
        .catch((error) => console.log('error: ', error));
    }
  }, [data.isLoading]);

  useEffect(() => {
    getNodeValues();
  }, []);

  const handleSubmit = (values) => {
    if (!values.tree_dropdown) {
      values.tree_dropdown = data.checked;
    }

    const params = {
      all_clusters: values.all_clusters,
      all_datastores: values.all_datastores,
      button: 'save',
      clusters_checked: [],
      datastores_checked: [],
      hosts_checked: [],
    };

    let clustersSplitValues = [];
    let datastoresSplitValues = [];

    if (!values.all_clusters) {
      const clustersTreeDropdown = values.clusters_tree;
      clustersSplitValues = clustersTreeDropdown.map((string) => string.split('#')[0]);
    }

    if (!values.all_datastores) {
      const datastoresTreeDropdown = values.datastores_tree;
      datastoresSplitValues = datastoresTreeDropdown.map((string) => string.split('#')[0]);
    }

    for (const node of clusterTree.tree_nodes) {
      const curr = [];
      if (node.nodes) {
        for (const hostNode of node.nodes) {
          if (clustersSplitValues.includes(hostNode.key)) {
            curr.push(hostNode.key);
            params.hosts_checked.push({ id: hostNode.key, capture: true });
          }
          if (hostNode === node.nodes[node.nodes.length - 1]) {
            if (curr.length === node.nodes.length) {
              params.clusters_checked.push({ id: node.key, capture: true });
              for (const val of curr) {
                const index = params.hosts_checked.findIndex((host) => host.id === val);
                if (index > -1) {
                  params.hosts_checked.splice(index, 1);
                }
              }
            } else {
              params.clusters_checked.push({ id: node.key, capture: false });
            }
          }
        }
      } else if (clustersSplitValues.includes(node.key)) {
        params.clusters_checked.push({ id: node.key, capture: true });
      } else {
        params.clusters_checked.push({ id: node.key, capture: false });
      }
    }

    for (const node of data.datastoresNodes) {
      const curr = [];
      if (node.children) {
        for (const hostNode of node.children) {
          if (values.datastores_tree && values.datastores_tree.includes(hostNode.value)) {
            curr.push(hostNode.value);
          }
          if (hostNode === node.children[node.children.length - 1]) {
            if (curr.length === node.children.length) {
              params.datastores_checked.push({ id: node.value.split('#')[0], capture: true });
              for (const val of curr) {
                const index = values.datastores_tree.findIndex((host) => host.id === val);
                if (index > -1) {
                  values.datastores_tree.splice(index, 1);
                }
              }
            } else {
              params.datastores_checked.push({ id: node.value.split('#')[0], capture: false });
            }
          }
        }
      } else if (datastoresSplitValues.includes(node.value.split('#')[0])) {
        params.datastores_checked.push({ id: node.value.split('#')[0], capture: true });
      } else {
        params.datastores_checked.push({ id: node.value.split('#')[0], capture: false });
      }
    }

    setData({
      ...data,
      isLoading: true,
      tempData: params,
    });
  };

  const handleReset = () => {
    getNodeValues();
  };

  return (
    <MiqFormRenderer
      className="toggle"
      schema={createSchema(
        clusterTree, datastoreTree, data.clustersNodes, data.datastoresNodes, data.hostsCheckedWithId,
        data.datastoresCheckedWithId, allClusters, allDatastores, data.callNumber,
      )}
      onSubmit={handleSubmit}
      canSubmit
      canReset
      onReset={handleReset}
      validate={(values) => customValidation(values)}
      FormTemplate={(props) => <FormTemplate {...props} />}
    />
  );
};

const FormTemplate = ({
  formFields,
}) => {
  const {
    handleSubmit, onReset, getState,
  } = useFormApi();
  const { valid } = getState();
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            <Button
              disabled={!valid || !modified}
              kind="primary"
              className="btnRight"
              type="submit"
              variant="contained"
            >
              {__('Save')}
            </Button>
            <Button
              disabled={!modified}
              kind="secondary"
              className="btnRight"
              variant="contained"
              onClick={onReset}
              type="button"
            >
              { __('Reset')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

SettingsCUCollectionTab.propTypes = {
  url: PropTypes.string,
  fetchURL: PropTypes.string,
  clusterTree: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  datastoreTree: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  allClusters: PropTypes.bool,
  allDatastores: PropTypes.bool,

};

SettingsCUCollectionTab.defaultProps = {
  url: '',
  fetchURL: '',
  clusterTree: undefined,
  datastoreTree: undefined,
  allClusters: false,
  allDatastores: false,
};

FormTemplate.propTypes = {
  formFields: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
};

FormTemplate.defaultProps = {
  formFields: undefined,
};

export default SettingsCUCollectionTab;

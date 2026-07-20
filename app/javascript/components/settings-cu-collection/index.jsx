import { useState, useEffect, useRef } from 'react';
import MiqFormRenderer from '@@ddf';
import {
  Db2Database, BareMetalServer,
} from '@carbon/react/icons';
import PropTypes from 'prop-types';
import { InlineNotification } from '@carbon/react';
import createSchema from './settings-cu-collection-tab.schema';

const CU_COLLECTION_URL = '/ops/cu_collection_update';
const CU_COLLECTION_FETCH_URL = '/ops/cu_collection_fetch';

const SettingsCUCollectionTab = ({
  clusterTree = undefined,
  datastoreTree = undefined,
  allClusters = false,
  allDatastores = false,
}) => {
  const idCounter = useRef(0);
  const [notification, setNotification] = useState(null); // { kind, title }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    clustersNodes: [],
    datastoresNodes: [],
    hostsCheckedWithId: [],
    datastoresCheckedWithId: [],
    allClusters,
    allDatastores,
    callNumber: 0,
  });

  const generateId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

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
      label: <span className="dropdown-label">{parseLabel(node.text)}</span>,
      showCheckbox: !isDatastore || node.nodes !== undefined || depth === 0,
      disabled: !isDatastore && !node.nodes && depth === 0,
    };

    let icon;
    switch (node.icon) {
      case 'fa fa-database':
        icon = <Db2Database color="black" />;
        break;

      case 'pficon pficon-cluster':
        icon = <BareMetalServer color="black" />;
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
    idCounter.current = 0;
    if (clusterTree) {
      const clustersBsTree = JSON.parse(clusterTree.bs_tree);
      clustersNodes = clustersBsTree.map((node) => transformTree(node, false, 0));
    }
    if (datastoreTree) {
      const datastoresBsTree = JSON.parse(datastoreTree.bs_tree);
      datastoresNodes = datastoresBsTree.map((node) => transformTree(node, true, 0));
    }

    http.get(CU_COLLECTION_FETCH_URL).then((result) => {
      const {
        hosts, datastores, all_clusters: fetchedAllClusters, all_datastores: fetchedAllDatastores,
      } = result;

      const hostsChecked = hosts
        .filter((host) => host.capture === true)
        .map((host) => `h-${host.id}`);

      const datastoresChecked = datastores
        .filter((ds) => ds.capture === true)
        .map((ds) => `ds-${ds.id}`);

      const hostsCheckedWithId = clustersNodes.flatMap((node) => {
        if (!node.children) {
          return [];
        }
        return node.children
          .filter((host) => hostsChecked.includes(host.value.split('#')[0]))
          .map((host) => host.value);
      });

      const datastoresCheckedWithId = datastoresNodes.flatMap((node) => {
        if (node.children) {
          const dsValue = node.value.split('#')[0];
          const dsId = dsValue.split('-')[1];
          const foundObject = datastores.find((item) => item.id === Number(dsId));
          if (datastoresChecked.includes(dsValue) && foundObject && foundObject.capture === true) {
            return node.children.map((child) => child.value);
          }
          return [];
        }
        return datastoresChecked.includes(node.value.split('#')[0]) ? [node.value] : [];
      });

      setData((prev) => ({
        ...prev,
        clustersNodes,
        datastoresNodes,
        hostsCheckedWithId,
        datastoresCheckedWithId,
        allClusters: fetchedAllClusters ?? prev.allClusters,
        allDatastores: fetchedAllDatastores ?? prev.allDatastores,
        callNumber: prev.callNumber + 1,
      }));
    });
  };

  useEffect(() => {
    getNodeValues();
  }, []);

  const handleSubmit = (values) => {
    setIsSubmitting(true);
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
      const clustersTreeDropdown = values.clusters_tree || [];
      clustersSplitValues = clustersTreeDropdown.map((string) => string.split('#')[0]);
    }

    if (!values.all_datastores) {
      const datastoresTreeDropdown = values.datastores_tree || [];
      datastoresSplitValues = datastoresTreeDropdown.map((string) => string.split('#')[0]);
    }

    clusterTree.tree_nodes.forEach((node) => {
      if (node.nodes) {
        const checkedHosts = node.nodes.filter((hostNode) => clustersSplitValues.includes(hostNode.key));
        const allChecked = checkedHosts.length === node.nodes.length;

        checkedHosts.forEach((hostNode) => {
          params.hosts_checked.push({ id: hostNode.key, capture: true });
        });

        if (allChecked) {
          params.clusters_checked.push({ id: node.key, capture: true });
          // When the whole cluster is checked, hosts are redundant — represented by the cluster entry.
          checkedHosts.forEach((hostNode) => {
            const index = params.hosts_checked.findIndex((h) => h.id === hostNode.key);
            if (index > -1) {
              params.hosts_checked.splice(index, 1);
            }
          });
        } else {
          params.clusters_checked.push({ id: node.key, capture: false });
        }
      } else {
        params.clusters_checked.push({ id: node.key, capture: clustersSplitValues.includes(node.key) });
      }
    });

    const datastoresTree = values.datastores_tree || [];
    data.datastoresNodes.forEach((node) => {
      if (node.children) {
        const checkedChildren = node.children.filter((child) => datastoresTree.includes(child.value));
        const allChecked = checkedChildren.length === node.children.length;
        params.datastores_checked.push({ id: node.value.split('#')[0], capture: allChecked });
      } else {
        params.datastores_checked.push({
          id: node.value.split('#')[0],
          capture: datastoresSplitValues.includes(node.value.split('#')[0]),
        });
      }
    });

    http.post(CU_COLLECTION_URL, params)
      .then((result) => {
        setIsSubmitting(false);
        setNotification({ kind: 'success', title: result.message });
        getNodeValues();
      })
      .catch((error) => {
        setIsSubmitting(false);
        setNotification({ kind: 'error', title: error.message || __('An error occurred') });
      });
  };

  const handleReset = () => {
    getNodeValues();
  };

  return (
    <>
      {notification && (
        <InlineNotification
          lowContrast
          className="cu-collection-notification"
          kind={notification.kind}
          title={notification.title}
          onCloseButtonClick={() => setNotification(null)}
        />
      )}
      <MiqFormRenderer
        key={data.callNumber}
        schema={createSchema(
          clusterTree, datastoreTree, data.clustersNodes, data.datastoresNodes, data.hostsCheckedWithId,
          data.datastoresCheckedWithId,
        )}
        initialValues={{
          all_clusters: data.allClusters,
          all_datastores: data.allDatastores,
          clusters_tree: data.hostsCheckedWithId,
          datastores_tree: data.datastoresCheckedWithId,
        }}
        onSubmit={handleSubmit}
        canReset
        onReset={handleReset}
        disableSubmit={isSubmitting ? ['submitting'] : ['pristine', 'invalid']}
      />
    </>
  );
};

SettingsCUCollectionTab.propTypes = {
  clusterTree: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  datastoreTree: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  allClusters: PropTypes.bool,
  allDatastores: PropTypes.bool,
};

export default SettingsCUCollectionTab;

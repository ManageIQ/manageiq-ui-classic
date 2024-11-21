import { componentTypes } from '@@ddf';

const createSchema = (
  clustersTree, datastoresTree, clustersNodes, datastoresNodes, hostsChecked, datastoresChecked, allClusters, allDatastores, callNumber,
) => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      id: 'parent-div',
      name: 'parent_div',
      className: 'parent-div',
      fields: [
        {
          component: componentTypes.SUB_FORM,
          id: 'clusters-box',
          name: 'clusters_box',
          className: 'clusters-box',
          fields: [
            {
              component: componentTypes.SUB_FORM,
              id: 'clusters-selection',
              name: 'clusters_section',
              className: 'clusters-section',
              fields: [
                {
                  component: componentTypes.SUB_FORM,
                  id: 'clusters-labels',
                  name: 'clusters_labels',
                  className: 'clusters-labels',
                  fields: [
                    {
                      component: componentTypes.PLAIN_TEXT,
                      id: 'clusters',
                      name: 'clusters',
                      className: 'clusters',
                      label: __('Clusters'),
                      style: { fontSize: '16px' },
                    },
                    {
                      component: componentTypes.PLAIN_TEXT,
                      id: 'collect-clusters',
                      name: 'collect_clusters',
                      className: 'collect-clusters',
                      label: __('Collect for All Clusters'),
                      style: { fontSize: '16px' },
                    },
                  ],
                },
                {
                  component: componentTypes.SWITCH,
                  id: 'all-clusters',
                  name: 'all_clusters',
                  className: 'toggle',
                  initialValue: allClusters,
                },
              ],
            },
            {
              component: componentTypes.PLAIN_TEXT,
              id: 'collect-note',
              name: 'collect_note',
              className: 'collect-note',
              label: __('Note: Collect for All Clusters must '
                + 'be checked to be able to collect C & U data from '
                + 'Cloud Providers such as Red Hat OpenStack or Amazon EC2'),
              style: { fontSize: '16px' },
            },
            {
              component: 'checkbox-tree',
              id: 'clusters-tree',
              name: 'clusters_tree',
              key: `${clustersNodes.length}${callNumber}`,
              className: 'clusters-tree',
              nodes: clustersNodes,
              checked: hostsChecked,
              condition: { and: [{ when: 'all_clusters', is: false }] },
              label: __('Enable Collection by Cluster'),
            },

            {
              component: componentTypes.PLAIN_TEXT,
              id: 'vm-data',
              name: 'vm_data',
              className: 'vm-data',
              condition: { and: [{ when: 'all_clusters', is: false }] },
              label: __(
                'VM data will be collected for VMs under selected Hosts only. '
                + 'Data is collected for a Cluster and all of its Hosts when at least one Host is selected.'
              ),
            },
            ...(clustersTree != null
              ? []
              : [{
                component: componentTypes.PLAIN_TEXT,
                id: 'available-clusters',
                name: 'available_clusters',
                className: 'available-clusters',
                label: __('Note: No Clusters available.'),
                style: { fontSize: '16px' },
              }]),
          ],
        },
        {
          component: componentTypes.SUB_FORM,
          id: 'datastores-box',
          name: 'datastores_box',
          className: 'datastores-box',
          fields: [
            {
              component: componentTypes.SUB_FORM,
              id: 'datastores-section',
              name: 'datastores_section',
              className: 'datastores-section',
              fields: [
                {
                  component: componentTypes.SUB_FORM,
                  id: 'datastores-labels',
                  name: 'datastores_labels',
                  className: 'datastores-labels',
                  fields: [
                    {
                      component: componentTypes.PLAIN_TEXT,
                      id: 'datastores',
                      name: 'datastores',
                      className: 'datastores',
                      label: __('Datastores'),
                      style: { fontSize: '16px' },
                    },
                    {
                      component: componentTypes.PLAIN_TEXT,
                      id: 'collect-datastores',
                      name: 'collect_datastores',
                      className: 'collect-datastores',
                      label: __('Collect for All Datastores'),
                      style: { fontSize: '16px' },
                    },
                  ],
                },
                {
                  component: componentTypes.SWITCH,
                  id: 'all_datastores',
                  name: 'all_datastores',
                  className: 'toggle',
                  initialValue: allDatastores,
                },
              ],
            },
            {
              component: 'checkbox-tree',
              id: 'datastores-tree',
              name: 'datastores_tree',
              className: 'datastores-tree',
              key: `${datastoresNodes.length}${callNumber}`,
              nodes: datastoresNodes,
              checked: datastoresChecked,
              condition: { and: [{ when: 'all_datastores', is: false }] },
              label: __('Enable Collection by Datastore'),
            },
            ...(datastoresTree != null
              ? []
              : [{
                component: componentTypes.PLAIN_TEXT,
                id: 'available-datastores',
                name: 'available_datastores',
                className: 'available-datastores',
                label: __('Note: No Datastores available.'),
                style: { fontSize: '16px' },
              }]),
          ],
        },
      ],
    },
  ];

  return {
    fields,
  };
};

export default createSchema;

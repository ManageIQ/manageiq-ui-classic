// import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { Loading, Modal, ModalBody } from 'carbon-components-react';
// import MiqDataTable from '../miq-data-table';
// import { http } from '../../http_api';

// const AutomateEntryPoints = ({
//   field, selected, type, setShowModal, setSelectedValue,
// }) => {
//   const [data, setData] = useState({
//     isLoading: true, list: {}, selectedItemId: selected,
//   });

//   const workflowTypes = {
//     provision: __('Provision'),
//     reconfigure: __('Reconfigure'),
//     retire: __('Retirement'),
//   };

//   useEffect(() => {
//     API.get('/api/automate')
//       .then((_data) => {
//         console.log(data);
//         setData({
//           ...data,
//           isLoading: false,
//         });
//       });
//   }, []);

//   /** Function to handle a row's click event. */
//   const onSelect = (selectedItemId) => {
//     setData({
//       ...data,
//       selectedItemId: (data.selectedItemId === selectedItemId) ? undefined : selectedItemId,
//     });
//     const params = `cfp-${encodeURIComponent(selectedItemId)}&tree=automate_catalog_tree&field=${field}`;
//     window.miqJqueryRequest(`/catalog/ae_tree_select/?id=${params}&typ=${type}`);
//   };
//   if (data.isLoading) {
//     return (<Loading active small withOverlay={false} className="loading" />);
//   }
//   /** Function to handle the modal box close button click event. */
//   const onCloseModal = () => {
//     if (setShowModal) {
//       setShowModal(false);
//     } else {
//       document.getElementById(`${type}-workflows`).innerHTML = '';
//       http.post('/catalog/ae_tree_select_toggle?button=cancel', {}, { headers: {}, skipJsonParsing: true });
//     }
//   };
//   /** Function to handle the modal box apply button click event. */
//   const onApply = () => {
//     const seletedItem = data.list.rows.find((item) => item.id === data.selectedItemId);
//     const name = seletedItem.name.text;
//     if (seletedItem) {
//       if (setShowModal && setSelectedValue) {
//         setShowModal(false);
//         setSelectedValue(seletedItem);
//       } else {
//         const nameField = document.getElementById(field);
//         const selectedField = document.getElementById(`${type}_configuration_script_id`);

//         if (nameField && selectedField) {
//           nameField.value = name;
//           selectedField.value = data.selectedItemId;
//           http.post('/catalog/ae_tree_select_toggle?button=submit&automation_type=workflow', {}, { headers: {}, skipJsonParsing: true })
//             .then((_data) => {
//               document.getElementById(`${type}-workflows`).innerHTML = '';
//             });
//         }
//       }
//     }
//   };
//   return (
//     <Modal
//       open
//       modalHeading={sprintf(__('Select Embedded Workflow - %s Entry Point'), workflowTypes[type])}
//       primaryButtonText={__('Apply')}
//       secondaryButtonText={__('Cancel')}
//       onRequestSubmit={onApply}
//       onRequestClose={onCloseModal}
//       className="workflows-entry-point-modal"
//     >
//       <ModalBody className="workflows-entry-point-modal-body">
//         <MiqDataTable
//           headers={data.list.headers}
//           rows={data.list.rows}
//           onCellClick={(selectedRow) => onSelect(selectedRow.id)}
//           showPagination={false}
//           truncateText={false}
//           mode="automated-workflow-entry-points"
//           gridChecks={[data.selectedItemId]}
//           size="md"
//         />
//       </ModalBody>
//     </Modal>
//   );
// };
// AutomateEntryPoints.propTypes = {
//   field: PropTypes.string.isRequired,
//   type: PropTypes.string.isRequired,
//   selected: PropTypes.string,
//   setShowModal: PropTypes.func,
//   setSelectedValue: PropTypes.func,
// };

// AutomateEntryPoints.defaultProps = {
//   selected: '',
//   setShowModal: undefined,
//   setSelectedValue: undefined,
// };

// export default AutomateEntryPoints;

import React, { useEffect, useState } from 'react';
import { FolderOpen16, Folder16, Document16 } from '@carbon/icons-react';
import TreeView, { flattenTree } from 'react-accessible-treeview';
import './styles.css';

const DirectoryTreeView = () => {
//   const [treeData, setTreeData] = useState([{
//     id: 'root',
//     name: '',
//     children: [
//       {
//         id: 'src_folder',
//         name: 'src',
//       },
//     ],
//   },
//   ]);

  // const folder = {
  //   id: 'root',
  //   name: '',
  //   children: [
  //     {
  //       id: 'src_folder',
  //       name: 'src',
  //       children: [
  //         {
  //           id: 'index.js_file',
  //           name: 'index.js',
  //           metadata: { a: '1', b: '2', c: 'test' },
  //         },
  //         {
  //           id: 'styles.css_file',
  //           name: 'styles.css',
  //           metadata: { a: '1', b: '2', c: 'test' },
  //         }],
  //     },
  //     {
  //       id: 'node_modules_folder',
  //       name: 'node_modules',
  //       children: [
  //         {
  //           id: 'react-accessible-treeview-folder',
  //           name: 'react-accessible-treeview',
  //           children: [{
  //             id: 'index.js_file2',
  //             name: 'index.js',
  //           }],
  //         },
  //         {
  //           id: 'react_folder',
  //           name: 'react',
  //           children: [{
  //             id: 'index.js_file3',
  //             name: 'index.js',
  //           }],
  //         },
  //       ],
  //     },
  //     {
  //       id: '.npmignore_file',
  //       name: '.npmignore',
  //     },
  //     {
  //       id: 'package.json_file',
  //       name: 'package.json',
  //     },
  //     {
  //       id: 'webpack.config.js_file',
  //       name: 'webpack.config.js',
  //     },
  //   ],
  // };

  const root = {
    id: 'root',
    name: '',
    children: [
      // {
      //   id: 'datastore_folder',
      //   name: __('Datastore'),
      //   children: [{}],
      // },
    ],
  };

  const [rawTreeData, setRawTreeData] = useState(root);
  const [treeData, setTreeData] = useState(flattenTree(root));
  const [expandedIds, setExpandedIds] = useState([]);
  const [treeIds, setTreeIds] = useState(['datastore_folder']);
  const [key, setKey] = useState('initial');

  useEffect(() => {
    const newChildren = [];
    API.get('/api/automate_domains?expand=resources').then((apiData) => {
      console.log(apiData);
      apiData.resources.forEach((domain) => {
        newChildren.push({
          id: domain.id,
          name: domain.name,
          children: [{}],
          parent: 'datastore_folder',
          metadata: {},
        });
      });
      return newChildren;
    }).then((newChildren) => {
      const tempIdsArray = treeIds;
      newChildren.forEach((node) => {
        if (!treeIds.includes(node.id)) {
          tempIdsArray.push(node.id);
        }
      });
      const tempData = root;
      tempData.children = [{
        id: 'datastore_folder',
        name: __('Datastore'),
      }];
      tempData.children[0].children = newChildren;
      setTreeIds(tempIdsArray);
      setTreeData(flattenTree(tempData));
    });
  }, []);

  useEffect(() => {
    console.log(rawTreeData);
    setTreeData(flattenTree(rawTreeData));
  }, [rawTreeData]);

  useEffect(() => {
    console.log(treeData);
    if (treeData.length > 3) {
      setExpandedIds(['datastore_folder']);
      setKey(treeData.length);
    }
  }, [treeData]);

  const FolderIcon = ({ isOpen }) =>
    (isOpen ? (
      <FolderOpen16 className="icon" />
    ) : (
      <Folder16 className="icon" />
    ));

  const FileIcon = ({ filename }) => {
    if (filename) {
      const extension = filename.slice(filename.lastIndexOf('.') + 1);
      switch (extension) {
        case 'js':
          return <Document16 className="icon" />;
        case 'css':
          return <Document16 className="icon" />;
        case 'json':
          return <Document16 className="icon" />;
        case 'npmignore':
          return <Document16 className="icon" />;
        default:
          return <Document16 className="icon" />;
      }
    } else {
      return <Document16 className="icon" />;
    }
  };

  const onSelect = (value) => {
    if (value && value.isSelected === true) {
      console.log(value);
    }
  };

  const onExpand = (value) => {
    console.log(value);
    const tempData = treeData;
    const newChildren = [];

    if (value && value.element && value.element.id !== 'datastore_folder') {
      API.get(`/api/automate/${value.element.name}?depth=1`).then((test) => {
        tempData.forEach((node) => {
          if (node.id === value.element.id) {
            node.children = ['new-test-0'];
            tempData.push({
              id: 'new-test-0',
              name: 'new test',
              children: [],
              parent: node.id,
              metadata: {},
            });
            console.log(tempData);
            setTreeData(tempData);
          }
        });
      });
    }
    // if (value && value.element && value.element.id === 'datastore_folder') {
    //   const ids = value.element.id.split('_');
    //   if (ids.includes('folder')) {
    //     tempData.forEach((item) => {
    //       if (item.id === value.element.id) {
    //         console.log(item.name);
    //         API.get('/api/automate_domains?expand=resources').then((apiData) => {
    //           console.log(apiData);
    //           apiData.resources.forEach((domain) => {
    //             newChildren.push({
    //               id: domain.id,
    //               name: domain.name,
    //               children: [],
    //               parent: item.id,
    //               metadata: {},
    //             });
    //           });
    //           return newChildren;
    //         }).then((newChildrenArray) => {
    //           const newTreeData = treeData;
    //           const tempIdsArray = treeIds;
    //           newChildrenArray.forEach((node) => {
    //             if (!treeIds.includes(node.id)) {
    //               newTreeData.push(node);
    //               tempIdsArray.push(node.id);
    //               newTreeData[1].children.push(node.id);
    //             }
    //           });
    //           setTreeIds(tempIdsArray);
    //           setTreeData(newTreeData);
    //           // if (treeData.includes(newChildrenArray[0]) === false) {
    //           //   // newTreeData[1].children = ['index.js_file', 'styles.css_file', '1177'];
    //           //   if (treeData.length === 12) {
    //           //     setTreeData(newTreeData);
    //           //     // Send all relevant data including new children and the clicked item to a new useffect using a new state variable
    //           //     // From this new use effect we can set the treedata, expandedids and the key state variables
    //           //   }
    //           // }
    //         });
    //       }
    //     });
    //   }
    // }
  };

  return (
    <div>
      <div className="directory">
        {treeData.length > 1
          ? (
            <TreeView
              key={key}
              data={treeData}
              aria-label="directory tree"
              defaultSelectedIds={[]}
              onSelect={onSelect}
              onExpand={onExpand}
              defaultExpandedIds={expandedIds}
              nodeRenderer={({
                element,
                isBranch,
                isExpanded,
                getNodeProps,
                level,
              }) => {
                getNodeProps();
                return (
                  <div {...getNodeProps()} style={{ paddingLeft: 20 * (level - 1) }}>
                    {isBranch ? (
                      <FolderIcon isOpen={isExpanded} />
                    ) : (
                      <FileIcon filename={element.name} />
                    )}

                    {element.name}
                  </div>
                );
              }}
            />
          ) : null}
      </div>
    </div>
  );
};

DirectoryTreeView.propTypes = {
};

DirectoryTreeView.defaultProps = {
};

export default DirectoryTreeView;

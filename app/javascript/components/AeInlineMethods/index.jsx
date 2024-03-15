/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, ModalBody } from 'carbon-components-react';
import MiqTree from '../MiqTreeView';

/** Component to render a tree and to select an embedded method. */
const AeInlineMethod = ({ type }) => {
  const [data, setData] = useState({
    isModalOpen: false,
    selectedNode: undefined,
    list: [],
  });

  /** Function to show/hide the modal. */
  const showModal = (status) => {
    setData({
      ...data,
      isModalOpen: status,
    });
  };

  /** Function to render the Add method button. */
  const renderAddButton = () => (
    <Button
      id="add-method"
      kind="primary"
      title={__('Add Method')}
      onClick={() => showModal(true)}
      size="sm"
    >
      {__('Add method')}
    </Button>
  );

  console.log(data);

  const renderList = () => (data.list.map((item) => (
    <div key={item.key}>
      <div>{item.fqname}</div>
    </div>
  )));

  return (
    <div>
      {renderAddButton()}
      {renderList()}
      <Modal
        primaryButtonDisabled={data.selectedNode === undefined}
        size="lg"
        modalHeading={__('Select item')}
        open={data.isModalOpen}
        primaryButtonText={__('OK')}
        secondaryButtonText={__('Cancel')}
        onRequestClose={() => showModal(false)}
        onRequestSubmit={() => {
          console.log('on onRequestSubmit');
          setData({
            ...data,
            list: data.list.push(data.selectedNode),
          });
          showModal(false);
        }}
        onSecondarySubmit={() => {
          console.log('on onSecondarySubmit');
          showModal(false);
        }}
      >
        <ModalBody>
          {
            data.isModalOpen
              && (
                <MiqTree
                  type={type}
                  onNodeSelect={(item) => {
                    setData({
                      ...data,
                      selectedNode: item,
                    });
                  }}
                />
              )
          }
        </ModalBody>
      </Modal>

    </div>
  );
};

export default AeInlineMethod;

AeInlineMethod.propTypes = {
  type: PropTypes.string.isRequired,
};

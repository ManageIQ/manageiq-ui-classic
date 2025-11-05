import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './styles.css';
import SnapshotTree from './snapshot-tree';

const VMSnapshotTreeSelect = ({
  tree, snapshot, size, time, name,
}) => {
  const [currentSnapshot, setCurrentSnapshot] = useState({ ...snapshot, size, time });

  // eslint-disable-next-line react/prop-types
  return (
    <div>
      <div className="snapshot-details-div">
        <div className="snapshot-details">
          <div className="snapshot-detail-title">
            <p>
              <b>
                {__('Description')}
              </b>
            </p>
          </div>
          <div className="snapshot-detail-value">
            {currentSnapshot.data ? currentSnapshot.data.description : currentSnapshot.description || ''}
          </div>
        </div>
        <div className="snapshot-details">
          <div className="snapshot-detail-title" id="size-title">
            <p>
              <b>
                {__('Size')}
              </b>
            </p>
          </div>
          <div className="snapshot-detail-value">
            {currentSnapshot.size || ''}
          </div>
        </div>
        <div className="snapshot-details">
          <div className="snapshot-detail-title" id="created-title">
            <p>
              <b>
                {__('Created')}
              </b>
            </p>
          </div>
          <div className="snapshot-detail-value">
            {currentSnapshot.time || ''}
          </div>
        </div>
      </div>
      <div className="snapshot-tree-title">
        {__('Available Snapshots')}
      </div>
      {tree.nodes && tree.nodes.length > 1
        ? <SnapshotTree nodes={tree.tree_nodes} setCurrentSnapshot={setCurrentSnapshot} />
        : (
          <div className="no-snapshots-message">
            {sprintf(__('%s has no snapshots'), name)}
          </div>
        )}
    </div>
  );
};

VMSnapshotTreeSelect.propTypes = {
  tree: PropTypes.objectOf(PropTypes.any).isRequired,
  snapshot: PropTypes.objectOf(PropTypes.any),
  size: PropTypes.string,
  time: PropTypes.string,
  name: PropTypes.string,
};

VMSnapshotTreeSelect.defaultProps = {
  snapshot: {},
  size: '',
  time: '',
  name: '',
};

export default VMSnapshotTreeSelect;

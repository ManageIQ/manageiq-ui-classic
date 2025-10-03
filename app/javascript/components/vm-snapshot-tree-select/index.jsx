import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './styles.css';
import SnapshotTree from './snapshot-tree';

const VMSnapshotTreeSelect = ({
  tree, selected, size, time,
}) => {
  const [snapshot, setSnapshot] = useState({ ...selected, size, time });

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
            {snapshot.data ? snapshot.data.description : snapshot.description || ''}
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
            {snapshot.size || ''}
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
            {snapshot.time || ''}
          </div>
        </div>
      </div>
      <SnapshotTree nodes={tree.tree_nodes} setSnapshot={setSnapshot} />
    </div>
  );
};

VMSnapshotTreeSelect.propTypes = {
  tree: PropTypes.objectOf(PropTypes.any).isRequired,
  selected: PropTypes.objectOf(PropTypes.any),
  size: PropTypes.string,
  time: PropTypes.string,
};

VMSnapshotTreeSelect.defaultProps = {
  selected: {},
  size: '',
  time: '',
};

export default VMSnapshotTreeSelect;

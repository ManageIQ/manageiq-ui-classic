import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';

const TimelineTable = ({ data }) => {
  // TODO Commented out columns exist in certain pages but not other
  // we need to figure out how to distinguish when which columns are used
  const headers = [
    {
      key: 'event_type',
      header: __('Event Type'),
    },
    {
      key: 'source',
      header: __('Event Source'),
    },
    {
      key: 'group_level',
      header: __('Group Level'),
    },
    {
      key: 'provider',
      header: __('Provider'),
    },
    // {
    //   key: 'provider_username',
    //   header: __('Provider User Name'),
    // },
    {
      key: 'host',
      header: __('Source Host'),
    },
    // {
    //   key: 'source_vm',
    //   header: __('Source VM'),
    // },
    // {
    //   key: 'source_vm_location',
    //   header: __('Source VM Location'),
    // },
    {
      key: 'message',
      header: __('Message'),
    },
  ];
  /**
   * NOTE: In the original tables, the information displayed was different
   * depending from where you accessed the timeline page from
   *
   * Ex. 'Source VM Location' would now appear on the Host page, but it would
   * for the VM & Templates page
   */

  const renderTimeStampLabel = () => (
    <label className="bx--label">
      {
        sprintf(__('This is a group of events that happened on %s.'), Date(data[0].timestamp))
      }
    </label>
  );

  return (
    <div className="timeline-data-table">
      {
        data && data.length > 0 && (
          <>
            {
              data[0].timeline && renderTimeStampLabel()
            }
            <MiqDataTable
              rows={data}
              headers={headers}
              truncateText={false}
            />
          </>
        )
      }

    </div>

  );
};

TimelineTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

TimelineTable.defaultProps = {
  data: [{
    timestamp: '',
    event_type: '',
    source: '',
    group_level: '',
    provider: '',
    host: '',
    message: '',
  }],
};

export default TimelineTable;

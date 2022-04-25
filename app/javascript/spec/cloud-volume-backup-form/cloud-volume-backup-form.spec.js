import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import CloudVolumeBackupForm from '../../components/cloud-volume-backup-form';
import { restoreData } from '../../components/cloud-volume-backup-form/helper';

require('../helpers/miqSparkle');
require('../helpers/miqAjaxButton');

const cloudVolume = { recordId: '23', name: 'Cloud volume name', type: 'restore' };

describe('Cloud Volume backup form component', () => {
  beforeEach(() => {
    fetchMock
      .mock(`/api/cloud_volumes?expand=resources&attributes=name,id`, {});
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const data = restoreData(cloudVolume.recordId, cloudVolume.name, cloudVolume.type);

  it('should render the restore cloud volume backup form', () => {
    const wrapper = mount(<CloudVolumeBackupForm
      recordId={cloudVolume.recordId}
      name={cloudVolume.name}
      type={cloudVolume.type}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('when restoring cloud volume from backup', async(done) => {
    // fetchMock.getOnce('/api/cloud_volumes?expand=resources&attributes=name,id', {});
    const payload = {
      volume: { id: 100, name: 'name' },
      button: 'restore',
      id: 1,
      name: '',
    };
    fetchMock.postOnce(data.save.postUrl, payload);
    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudVolumeBackupForm
        recordId={cloudVolume.recordId}
        name={cloudVolume.name}
        type={cloudVolume.type}
      />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});

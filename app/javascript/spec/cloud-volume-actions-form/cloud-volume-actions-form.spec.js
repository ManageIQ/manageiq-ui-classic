import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import CloudVolumeActions from '../../components/cloud-volume-actions-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { CloudVolumeActionTypes, formData } from '../../components/cloud-volume-actions-form/helper';

require('../helpers/miqSparkle');
require('../helpers/miqAjaxButton');

const record = { recordId: '23', name: 'Cloud volume name' };
const expectedKeys = {
  main: ['type', 'schema', 'cancel', 'save'],
  save: ['action', 'postUrl', 'successUrl', 'message'],
  cancel: ['url', 'message'],
};

describe('create form data object has keys containing', () => {
  const cloudVolume = { ...record, type: CloudVolumeActionTypes.CREATE_BACKUP };
  const data = formData(cloudVolume.recordId, cloudVolume.name, cloudVolume.type);
  it('matches the expected type and object keys of formData', () => {
    expect(data.type).toEqual(CloudVolumeActionTypes.CREATE_BACKUP);
    expect(Object.keys(data)).toEqual(expect.arrayContaining(expectedKeys.main));
    expect(Object.keys(data.cancel)).toEqual(expect.arrayContaining(expectedKeys.cancel));
    expect(Object.keys(data.save)).toEqual(expect.arrayContaining(expectedKeys.save));
  });
});

describe('Cloud Volume Backup Create form component', () => {
  const cloudVolume = { ...record, type: CloudVolumeActionTypes.CREATE_BACKUP };
  const data = formData(cloudVolume.recordId, cloudVolume.name, cloudVolume.type);
  const createBackupComponent = (
    <CloudVolumeActions
      recordId={cloudVolume.recordId}
      name={cloudVolume.name}
      type={cloudVolume.type}
    />
  );

  it('should render the cloud volume backup create form', async() => {
    const wrapper = mount(createBackupComponent);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('when adding a new backup of cloud volume', () => {
    const resources = {
      backup_name: 'Backup of Cloud volume name',
      incremental: true,
      force: true,
    };
    fetchMock.postOnce(data.save.postUrl, resources);
    const wrapper = mount(createBackupComponent);

    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call miqRedirectBack when the create form is cancelled', () => {
    const wrapper = mount(createBackupComponent);
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith(data.cancel.message, 'success', data.cancel.url);
  });
});

describe('Cloud Volume Restore from backup form component', () => {
  const cloudVolume = { ...record, type: CloudVolumeActionTypes.RESTORE_FROM_BACKUP };
  const restoreFromBackupComponent = (
    <CloudVolumeActions
      recordId={cloudVolume.recordId}
      name={cloudVolume.name}
      type={cloudVolume.type}
    />
  );
  const data = formData(cloudVolume.recordId, cloudVolume.name, cloudVolume.type);

  beforeEach(() => {
    fetchMock
      .mock(`/api/cloud_volumes/${cloudVolume.recordId}?attributes=cloud_volume_backups`, {});
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  describe('restore from backup form data object has keys containing', () => {
    it('matches the expected type and object keys of formData', () => {
      expect(data.type).toEqual(CloudVolumeActionTypes.RESTORE_FROM_BACKUP);
      expect(Object.keys(data)).toEqual(expect.arrayContaining(expectedKeys.main));
      expect(Object.keys(data.cancel)).toEqual(expect.arrayContaining(expectedKeys.cancel));
      expect(Object.keys(data.save)).toEqual(expect.arrayContaining(expectedKeys.save));
    });
  });

  it('should render the cloud volume backup restore form', async() => {
    let wrapper;
    await act(async() => {
      wrapper = mount(restoreFromBackupComponent);
    });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('when restoring cloud volume from backup', async() => {
    let wrapper;
    fetchMock.postOnce(data.save.postUrl, { backup_id: '1' });
    await act(async() => {
      wrapper = mount(restoreFromBackupComponent);
    });

    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call miqRedirectBack when the restore from backup form is cancelled', async() => {
    let wrapper;
    await act(async() => {
      wrapper = mount(restoreFromBackupComponent);
    });
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith(data.cancel.message, 'success', data.cancel.url);
  });
});

describe('Cloud Volume Snapshot Create form component', () => {
  const cloudVolume = { ...record, type: CloudVolumeActionTypes.CREATE_SNAPSHOT };
  const createSnapshotComponent = (
    <CloudVolumeActions
      recordId={cloudVolume.recordId}
      name={cloudVolume.name}
      type={cloudVolume.type}
    />
  );

  const data = formData(cloudVolume.recordId, cloudVolume.name, cloudVolume.type);

  describe('create form data object has keys containing', () => {
    it('matches the expected type and object keys of formData', () => {
      expect(data.type).toEqual(CloudVolumeActionTypes.CREATE_SNAPSHOT);
      expect(Object.keys(data)).toEqual(expect.arrayContaining(expectedKeys.main));
      expect(Object.keys(data.cancel)).toEqual(expect.arrayContaining(expectedKeys.cancel));
      expect(Object.keys(data.save)).toEqual(expect.arrayContaining(expectedKeys.save));
    });
  });

  it('should render the cloud volume snapshot create form', () => {
    const wrapper = mount(createSnapshotComponent);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('when adding a new snapshot of cloud volume', () => {
    const resources = {
      backup_name: 'Snapshot of Cloud volume name',
      incremental: true,
      force: true,
    };
    fetchMock.postOnce(data.save.postUrl, resources);
    const wrapper = mount(createSnapshotComponent);

    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call miqRedirectBack when the create form is cancelled', () => {
    const wrapper = mount(createSnapshotComponent);
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith(data.cancel.message, 'success', data.cancel.url);
  });
});

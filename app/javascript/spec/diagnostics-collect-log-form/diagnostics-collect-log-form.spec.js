import React from 'react';
import { act } from 'react-dom/test-utils';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import DiagnosticsCollectLogForm from '../../components/diagnostics-collect-log-form';
import { mount } from '../helpers/mountForm';

describe('Diagnostics Collect Log form component', () => {
  const options = {
    '': '<No Depot>',
    FileDepotFtp: 'FTP',
    FileDepotFtpAnonymous: 'Anonymous FTP',
    FileDepotNfs: 'NFS',
    FileDepotSmb: 'Samba',
  };
  const prefixes = {
    FileDepotFtp: 'ftp',
    FileDepotFtpAnonymous: 'ftp',
    FileDepotNfs: 'nfs',
    FileDepotSmb: 'smb',
  };
  it('should render new DiagnosticsCollectLogForm for Server', () => {
    const initialData = {
      recordId: 'new',
      name: '',
      options,
      prefixes,
      controller: 'ops',
      logType: 'Server',
      displayName: 'EVM [17]',
    };
    fetchMock.postOnce(`/ops/log_depot_edit/${initialData.recordId}`, {});
    const wrapper = mount(<DiagnosticsCollectLogForm initialData={initialData} />);
    expect(wrapper.find('select[name="log_protocol"]')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render edit DiagnosticsCollectLogForm for Server for ftp', async(done) => {
    const initialData = {
      recordId: 10,
      name: 'EVM',
      options,
      prefixes,
      controller: 'ops',
      logType: 'Server',
      displayName: 'EVM [17]',
    };
    fetchMock.getOnce(`/${initialData.controller}/log_collection_form_fields/${initialData.recordId}`, {});
    const paramData = { uri_prefix: 'ftp', log_protocol: 'FileDepotFtp', log_password: '123456' };
    fetchMock.postOnce(`/ops/log_depot_edit/${initialData.recordId}`, paramData);
    let wrapper;
    await act(async() => {
      wrapper = mount(<DiagnosticsCollectLogForm initialData={initialData} />);
    });
    wrapper.update();
    expect(wrapper.find('select[name="log_protocol"]')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render edit DiagnosticsCollectLogForm for Server for no depot', async(done) => {
    const initialData = {
      recordId: 11,
      name: 'EVM',
      options,
      prefixes,
      controller: 'ops',
      logType: 'Server',
      displayName: 'EVM [17]',
    };
    fetchMock.getOnce(`/${initialData.controller}/log_collection_form_fields/${initialData.recordId}`, {});
    const paramData = { log_password: '123456' };
    fetchMock.postOnce(`/ops/log_depot_edit/${initialData.recordId}`, paramData);
    let wrapper;
    await act(async() => {
      wrapper = mount(<DiagnosticsCollectLogForm initialData={initialData} />);
    });
    wrapper.update();
    expect(wrapper.find('select[name="log_protocol"]')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});

import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';

import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/sprintf';

import ServiceDialogFromOt from '../../components/orchestration-template/service-dialog-from-ot';

describe('<ServiceDialogFromOt />', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {
      otId: 123,
    };
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should submit data correctly', (done) => {
    fetchMock.postOnce('/api/service_dialogs', {});
    fetchMock.getOnce('/api/service_dialogs?filter[]=label=undefined', { subcount: 0 });
    fetchMock.getOnce('/api/service_dialogs?filter[]=label=Foo', { subcount: 0 });

    const wrapper = mount(<ServiceDialogFromOt {...initialProps} />);
    // need to use timeout because of debounced request
    setTimeout(() => {
      // should check if label is unique
      expect(fetchMock.calls()).toHaveLength(1);
      // form is invalid so should not call submit;
      wrapper.find('button').first().simulate('click');
      wrapper.find('input').simulate('change', { target: { value: 'Foo' } });
      setTimeout(() => {
        wrapper.find('button').first().simulate('click');
        expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual({
          action: 'orchestration_template_service_dialog',
          resource: { label: 'Foo', ot_id: 123 },
        });
        done();
      }, 500);
    }, 500);
  });

  it('should fail async label validation', (done) => {
    fetchMock.getOnce('/api/service_dialogs?filter[]=label=undefined', { subcount: 1 });
    fetchMock.getOnce('/api/service_dialogs?filter[]=label=Bla', { subcount: 1 });

    const wrapper = mount(<ServiceDialogFromOt {...initialProps} />);

    setTimeout(() => {
      wrapper.find('input').simulate('change', { target: { value: 'Bla' } });
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.find('button').first().props().disabled).toEqual(true);
        done();
      }, 500);
    }, 500);
  });
});

import React from 'react';
import fetchMock from 'fetch-mock';

import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/sprintf';
import { mount } from '../helpers/mountForm';

import miqRedirectBack from '../../helpers/miq-redirect-back';

import ServiceDialogFromOt from '../../components/service-dialog-from-form/service-dialog-from';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('<ServiceDialogFromOt />', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {
      templateId: 123,
      dialogClass: 'dialogClass',
      templateClass: 'templateClass',
      miqRedirectBackAdress: '/go/back',
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
          action: 'template_service_dialog',
          resource: {
            label: 'Foo', template_id: 123, dialog_class: initialProps.dialogClass, template_class: initialProps.templateClass,
          },
        });
        // after submit
        setImmediate(() => {
          expect(miqRedirectBack).toHaveBeenCalledWith(expect.any(String), 'success', initialProps.miqRedirectBackAdress);
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

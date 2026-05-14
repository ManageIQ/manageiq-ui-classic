import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import { renderWithRedux } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import ServiceDialogFromOt from '../../components/service-dialog-from-form/service-dialog-from';

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

  it('should submit data correctly', async() => {
    const user = userEvent.setup();
    fetchMock.postOnce('/api/service_dialogs', {});
    fetchMock.getOnce('/api/service_dialogs?filter[]=label=undefined', {
      subcount: 0,
    });
    fetchMock.getOnce('/api/service_dialogs?filter[]=label=Foo', {
      subcount: 0,
    });
    const { container } = renderWithRedux(
      <ServiceDialogFromOt {...initialProps} />
    );

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });

    const labelInput = screen.getByLabelText(/Service Dialog Name/i);
    await user.type(labelInput, 'Foo');
    // Wait for debounced validation after typing
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(2);
    });
    let submitButton;
    await waitFor(() => {
      submitButton = container.querySelector('button.cds--btn--primary');
      expect(submitButton).not.toBeDisabled();
    });
    await user.click(submitButton);
    await waitFor(() => {
      expect(fetchMock.called('/api/service_dialogs')).toBe(true);
    });
    expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual({
      action: 'template_service_dialog',
      resource: {
        label: 'Foo',
        template_id: 123,
        dialog_class: initialProps.dialogClass,
        template_class: initialProps.templateClass,
      },
    });
    await waitFor(() => {
      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.any(String),
        'success',
        initialProps.miqRedirectBackAdress
      );
    });
  });

  it('should fail async label validation', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce('/api/service_dialogs?filter[]=label=Bla', {
      subcount: 1,
    });
    const { container } = renderWithRedux(
      <ServiceDialogFromOt {...initialProps} />
    );

    let labelInput;
    await waitFor(() => {
      labelInput = screen.getByLabelText(/Service Dialog Name/i);
      expect(labelInput).toBeInTheDocument();
    });
    await user.type(labelInput, 'Bla');
    // Wait for debounced validation after typing
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });
    await waitFor(() => {
      const submitButton = container.querySelector('button.cds--btn--primary');
      expect(submitButton).toBeDisabled();
    });
  });
});

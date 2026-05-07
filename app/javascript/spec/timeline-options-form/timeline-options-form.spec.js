import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import TimelineOptions from '../../components/timeline-options/timeline-options';
import { sampleReponse } from './sample-data';
import { renderWithRedux } from '../helpers/mountForm';
import '../../oldjs/miq_application'; // for miqJqueryRequest

describe('Show Timeline Options form component', () => {
  let submitSpy;
  const dummySubmitChosenFormOptions = () => {};

  beforeEach(() => {
    fetchMock.once('/api/event_streams', sampleReponse);
    submitSpy = jest.spyOn(window, 'miqJqueryRequest');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  /*
   * Render Form
   */

  it('should render form', async() => {
    const { container } = renderWithRedux(
      <TimelineOptions submitChosenFormOptions={dummySubmitChosenFormOptions} />
    );
    await waitFor(() => {
      expect(container.querySelector('select')).toBeInTheDocument();
    });
    expect(container.querySelectorAll('select')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    expect(container.querySelectorAll('.cds--date-picker')).toHaveLength(2);
  });

  /*
   * Submit Logic
   */

  it('should not submit values when form is empty', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TimelineOptions submitChosenFormOptions={dummySubmitChosenFormOptions} />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /apply/i })
      ).toBeInTheDocument();
    });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    await user.click(applyButton);
    expect(submitSpy).toHaveBeenCalledTimes(0);
  });
});

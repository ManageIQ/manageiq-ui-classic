import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import SchemaSequenceEditor from '../../components/miq-ae-class/schema/sequence-editor';
import { renderWithRedux } from '../helpers/mountForm';
import '../helpers/miqSparkle';

import miqRedirectBack from '../../helpers/miq-redirect-back';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

const CLASS_ID = '99';
const FIELDS_URL = `/miq_ae_class/fields_seq_data?id=${CLASS_ID}`;
const SAVE_URL = `/miq_ae_class/fields_seq_save?id=${CLASS_ID}`;

const SAMPLE_FIELDS = [
  { id: 1, name: 'field_a', display_name: 'Field A', priority: 1 },
  { id: 2, name: 'field_b', display_name: 'Field B', priority: 2 },
  { id: 3, name: 'field_c', display_name: 'Field C', priority: 3 },
];

describe('SchemaSequenceEditor', () => {
  let httpPostSpy;

  beforeEach(() => {
    fetchMock.getOnce(FIELDS_URL, { fields: SAMPLE_FIELDS });
    httpPostSpy = jest.spyOn(window.http, 'post').mockResolvedValue({
      message: 'Class Schema Sequence was saved',
    });
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    httpPostSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('renders all fields in priority order with correct initial button states', async() => {
    renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);

    await waitFor(() => {
      expect(screen.getByText('Field A (field_a)')).toBeInTheDocument();
    });

    expect(screen.getByText('Field B (field_b)')).toBeInTheDocument();
    expect(screen.getByText('Field C (field_c)')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);

    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^reset$/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^cancel$/i })).not.toBeDisabled();
  });

  it('reorders via keyboard and enables Save and Reset', async() => {
    const user = userEvent.setup();
    renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);

    await waitFor(() => {
      expect(screen.getByText('Field A (field_a)')).toBeInTheDocument();
    });

    const firstItem = screen.getByLabelText(/Field A.*Press arrow keys/i);
    firstItem.focus();
    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      const items = screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });
      expect(items[0]).toHaveAccessibleName(/Field B.*Press arrow keys/i);
      expect(items[1]).toHaveAccessibleName(/Field A.*Press arrow keys/i);
      expect(items[2]).toHaveAccessibleName(/Field C.*Press arrow keys/i);
    });

    expect(screen.getByRole('button', { name: /^save$/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /^reset$/i })).not.toBeDisabled();
  });

  it('resets to original order when Reset is clicked after a keyboard reorder', async() => {
    const user = userEvent.setup();
    renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);

    await waitFor(() => {
      expect(screen.getByText('Field A (field_a)')).toBeInTheDocument();
    });

    const firstItem = screen.getByLabelText(/Field A.*Press arrow keys/i);
    firstItem.focus();
    await user.keyboard('{ArrowDown}');

    await user.click(screen.getByRole('button', { name: /^reset$/i }));

    const items = screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });
    expect(items[0]).toHaveAccessibleName(/Field A.*Press arrow keys/i);
    expect(items[1]).toHaveAccessibleName(/Field B.*Press arrow keys/i);

    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^reset$/i })).toBeDisabled();
  });

  it('POSTs the reordered field list to fields_seq_save and redirects on success', async() => {
    const user = userEvent.setup();
    renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);

    await waitFor(() => {
      expect(screen.getByText('Field A (field_a)')).toBeInTheDocument();
    });

    // Reorder via keyboard: move field_a down one position
    const firstItem = screen.getByLabelText(/Field A.*Press arrow keys/i);
    firstItem.focus();
    await user.keyboard('{ArrowDown}');

    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        SAVE_URL,
        expect.objectContaining({ fields: expect.any(Array) }),
        { skipErrors: [422] }
      );
    });

    // Verify the reordered priorities in the payload
    const [, postBody] = httpPostSpy.mock.calls[0];
    expect(postBody.fields[0]).toEqual({ id: 2, priority: 1 });
    expect(postBody.fields[1]).toEqual({ id: 1, priority: 2 });
    expect(postBody.fields[2]).toEqual({ id: 3, priority: 3 });

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Class Schema Sequence was saved',
      'success',
      '/miq_ae_class/explorer'
    );
  });

  it('redirects with warning flash when Cancel is clicked', async() => {
    const user = userEvent.setup();
    renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);

    await waitFor(() => {
      expect(screen.getByText('Field A (field_a)')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(miqRedirectBack).toHaveBeenCalledWith(
      expect.stringContaining('cancelled'),
      'warning',
      '/miq_ae_class/explorer'
    );
  });
});

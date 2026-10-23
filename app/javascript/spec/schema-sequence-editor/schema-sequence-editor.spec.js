import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SchemaSequenceEditor from '../../components/miq-ae-class/schema/sequence-editor';
import { renderWithRedux } from '../helpers/mountForm';
import '../helpers/miqSparkle';

import miqRedirectBack from '../../helpers/miq-redirect-back';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

const CLASS_ID = '99';
const SAVE_URL = `/miq_ae_class/fields_seq_save?id=${CLASS_ID}`;

const SAMPLE_FIELDS = [
  {
    id: 1, name: 'field_a', display_name: 'Field A', priority: 1,
  },
  {
    id: 2, name: 'field_b', display_name: 'Field B', priority: 2,
  },
  {
    id: 3, name: 'field_c', display_name: 'Field C', priority: 3,
  },
];

describe('SchemaSequenceEditor', () => {
  let httpGetSpy;
  let httpPostSpy;

  beforeEach(() => {
    httpGetSpy = jest.spyOn(window.http, 'get').mockResolvedValue({ fields: SAMPLE_FIELDS });
    httpPostSpy = jest.spyOn(window.http, 'post').mockResolvedValue({
      message: 'Class Schema Sequence was saved',
    });
  });

  afterEach(() => {
    httpGetSpy.mockRestore();
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

  it('blocks dragging a non-consecutive selection and shows an error', async() => {
    const user = userEvent.setup();
    renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);

    await waitFor(() => {
      expect(screen.getByText('Field A (field_a)')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[2]);

    const dragSource = screen.getByLabelText(/Field A.*Press arrow keys/i);
    // fireEvent returns false when the handler called preventDefault()
    const notPrevented = fireEvent.dragStart(dragSource, { dataTransfer: { setData: jest.fn() } });

    expect(notPrevented).toBe(false);
    expect(screen.getByText('Select only one or consecutive Fields to move up')).toBeInTheDocument();
  });

  describe('reordering', () => {
    const itemNames = () => screen.getAllByRole('button', { name: /Press arrow keys to reorder/i })
      .map((el) => el.textContent.match(/\(([^)]+)\)/)[1]);
    const dataTransfer = () => ({ setData: jest.fn(), effectAllowed: '', dropEffect: '' });

    const renderLoaded = async() => {
      renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);
      await waitFor(() => expect(screen.getByText('Field A (field_a)')).toBeInTheDocument());
    };

    it('renders the label and drag-and-drop helper text', async() => {
      await renderLoaded();

      expect(screen.getByText('Fields:')).toBeInTheDocument();
      expect(screen.getByText(/Drag and drop to reorder fields/)).toBeInTheDocument();
    });

    it('reorders a single item by dragging it over another one', async() => {
      await renderLoaded();
      const items = () => screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });

      fireEvent.dragStart(items()[0], { dataTransfer: dataTransfer() });
      fireEvent.dragOver(items()[2], { dataTransfer: dataTransfer() });
      fireEvent.dragEnd(items()[1]);

      await waitFor(() => expect(itemNames()).toEqual(['field_b', 'field_a', 'field_c']));
      expect(screen.getByRole('button', { name: /^save$/i })).not.toBeDisabled();
    });

    it('does not enable Save when a drag ends without changing the order', async() => {
      await renderLoaded();
      const items = () => screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });

      fireEvent.dragStart(items()[0], { dataTransfer: dataTransfer() });
      fireEvent.dragEnd(items()[0]);

      expect(itemNames()).toEqual(['field_a', 'field_b', 'field_c']);
      expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    });

    it('drags a group of consecutive selected items together', async() => {
      const user = userEvent.setup();
      await renderLoaded();
      const items = () => screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      fireEvent.dragStart(items()[1], { dataTransfer: dataTransfer() });
      fireEvent.dragOver(items()[0], { dataTransfer: dataTransfer() });
      fireEvent.dragEnd(items()[0]);

      await waitFor(() => expect(itemNames()).toEqual(['field_b', 'field_c', 'field_a']));
      expect(screen.getByRole('button', { name: /^save$/i })).not.toBeDisabled();
    });

    // Drags the first item over the third one, giving the order B, A, C.
    const dragFirstItemDown = () => {
      const items = () => screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });
      fireEvent.dragStart(items()[0], { dataTransfer: dataTransfer() });
      fireEvent.dragOver(items()[2], { dataTransfer: dataTransfer() });
      fireEvent.dragEnd(items()[1]);
    };

    it('POSTs the dragged order to fields_seq_save and redirects on success', async() => {
      const user = userEvent.setup();
      await renderLoaded();

      dragFirstItemDown();
      await waitFor(() => expect(itemNames()).toEqual(['field_b', 'field_a', 'field_c']));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => {
        expect(httpPostSpy).toHaveBeenCalledWith(
          SAVE_URL,
          { fields: [{ id: 2, priority: 1 }, { id: 1, priority: 2 }, { id: 3, priority: 3 }] },
          { skipErrors: [422] }
        );
      });
      expect(miqRedirectBack).toHaveBeenCalledWith('Class Schema Sequence was saved', 'success', '/miq_ae_class/explorer');
    });

    it('POSTs the order of a dragged group of selected items', async() => {
      const user = userEvent.setup();
      await renderLoaded();
      const items = () => screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);
      fireEvent.dragStart(items()[1], { dataTransfer: dataTransfer() });
      fireEvent.dragOver(items()[0], { dataTransfer: dataTransfer() });
      fireEvent.dragEnd(items()[0]);
      await waitFor(() => expect(itemNames()).toEqual(['field_b', 'field_c', 'field_a']));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => expect(httpPostSpy).toHaveBeenCalled());
      expect(httpPostSpy.mock.calls[0][1]).toEqual({
        fields: [{ id: 2, priority: 1 }, { id: 3, priority: 2 }, { id: 1, priority: 3 }],
      });
    });

    it('shows an error flash and does not redirect when save fails', async() => {
      const user = userEvent.setup();
      httpPostSpy.mockRejectedValue({ status: 422, data: { error: 'Save failed' } });
      await renderLoaded();

      dragFirstItemDown();
      await waitFor(() => expect(itemNames()).toEqual(['field_b', 'field_a', 'field_c']));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      expect(await screen.findByText('Save failed')).toBeInTheDocument();
      expect(miqRedirectBack).not.toHaveBeenCalled();
    });

    it('restores the original order when Reset is clicked after a drag', async() => {
      const user = userEvent.setup();
      await renderLoaded();

      dragFirstItemDown();
      await waitFor(() => expect(itemNames()).toEqual(['field_b', 'field_a', 'field_c']));
      expect(screen.getByRole('button', { name: /^reset$/i })).not.toBeDisabled();
      await user.click(screen.getByRole('button', { name: /^reset$/i }));

      await waitFor(() => expect(itemNames()).toEqual(['field_a', 'field_b', 'field_c']));
      expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /^reset$/i })).toBeDisabled();
    });

    it('clears the error message when a checkbox is toggled', async() => {
      const user = userEvent.setup();
      await renderLoaded();

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[2]);
      fireEvent.dragStart(screen.getByLabelText(/Field A.*Press arrow keys/i), { dataTransfer: dataTransfer() });
      expect(screen.getByText('Select only one or consecutive Fields to move up')).toBeInTheDocument();

      await user.click(checkboxes[2]);

      expect(screen.queryByText('Select only one or consecutive Fields to move up')).not.toBeInTheDocument();
    });
  });

  it('still renders the form when loading the fields fails', async() => {
    httpGetSpy.mockRejectedValue(new Error('boom'));
    renderWithRedux(<SchemaSequenceEditor classId={CLASS_ID} />);

    await waitFor(() => expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument());
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
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

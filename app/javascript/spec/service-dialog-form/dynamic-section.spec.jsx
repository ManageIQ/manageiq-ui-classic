import { screen, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import DynamicSection from '../../components/service-dialog-form/dynamic-section';

// DynamicField renders field widgets + API calls for TagControl; mock it to isolate DynamicSection.
jest.mock('../../components/service-dialog-form/dynamic-field', () => ({ field }) => (
  <div data-testid={`dynamic-field-${field.name}`} />
), { virtual: true });

const onAction = jest.fn();

const makeSection = (fields = [], overrides = {}) => ({
  label: 'My Section',
  dialog_fields: fields,
  ...overrides,
});

const makeField = (name, position = 0) => ({
  name,
  label: name,
  type: 'DialogFieldTextBox',
  default_value: '',
  dynamic: false,
  read_only: false,
  visible: true,
  options: { protected: false },
  resource_action: { resource_type: 'DialogField', ae_attributes: {} },
  _version: 1,
  position,
});

const render = (section, opts = {}) =>
  renderWithRedux(
    <DynamicSection
      section={section}
      tabIndex={0}
      sectionIndex={0}
      onAction={onAction}
      {...opts}
    />
  );

beforeEach(() => onAction.mockClear());

describe('DynamicSection — render', () => {
  it('renders the section header with the label', () => {
    render(makeSection([], { label: 'First Section' }));
    expect(screen.getByText('First Section')).toBeInTheDocument();
  });

  it('renders a placeholder when there are no fields', () => {
    render(makeSection([]));
    expect(screen.getByText(/drag items here/i)).toBeInTheDocument();
  });

  it('does NOT render the placeholder when there is at least one field', () => {
    render(makeSection([makeField('f1')]));
    expect(screen.queryByText(/drag items here/i)).toBeNull();
  });

  it('renders one mocked DynamicField per section field, sorted by position', () => {
    render(makeSection([makeField('b', 1), makeField('a', 0)]));
    // position 0 = 'a' should appear first
    const allFields = document.querySelectorAll('[data-testid^="dynamic-field-"]');
    expect(allFields).toHaveLength(2);
    expect(allFields[0].getAttribute('data-testid')).toBe('dynamic-field-a');
    expect(allFields[1].getAttribute('data-testid')).toBe('dynamic-field-b');
  });
});

describe('DynamicSection — header button actions', () => {
  it('fires section.edit when the Edit button is clicked', () => {
    render(makeSection([], { label: 'X' }));
    fireEvent.click(screen.getByRole('button', { name: /edit section/i }));
    expect(onAction).toHaveBeenCalledWith('section.edit', { tabIndex: 0, sectionIndex: 0 });
  });

  it('fires section.delete when the Delete button is clicked', () => {
    render(makeSection([], { label: 'X' }));
    fireEvent.click(screen.getByRole('button', { name: /delete section/i }));
    expect(onAction).toHaveBeenCalledWith('section.delete', { tabIndex: 0, sectionIndex: 0 });
  });
});

describe('DynamicSection — palette drop', () => {
  it('fires field.add with the field type when a palette item is dropped on the body', () => {
    render(makeSection([]));
    const body = document.querySelector('.dynamic-section__body');
    fireEvent.dragOver(body, {
      dataTransfer: { types: ['text/plain'], dropEffect: '' },
    });
    fireEvent.drop(body, {
      dataTransfer: { getData: (k) => (k === 'text/plain' ? 'DialogFieldTextBox' : '') },
    });
    expect(onAction).toHaveBeenCalledWith('field.add', {
      tabIndex: 0, sectionIndex: 0, fieldType: 'DialogFieldTextBox',
    });
  });

  it('does NOT fire field.add when the dropped data is empty', () => {
    render(makeSection([]));
    const body = document.querySelector('.dynamic-section__body');
    fireEvent.drop(body, {
      dataTransfer: { getData: () => '' },
    });
    expect(onAction).not.toHaveBeenCalled();
  });
});

describe('DynamicSection — section reorder drop', () => {
  it('fires section.reorder when a section is dropped onto this section', () => {
    render(makeSection([], { label: 'Section 1' }), { sectionIndex: 2 });
    const sectionEl = document.querySelector('.dynamic-section');
    fireEvent.dragOver(sectionEl, {
      dataTransfer: { types: ['application/sd-section'], dropEffect: '' },
    });
    fireEvent.drop(sectionEl, {
      dataTransfer: {
        getData: (k) => (k === 'application/sd-section' ? '0' : ''),
      },
    });
    expect(onAction).toHaveBeenCalledWith('section.reorder', {
      tabIndex: 0, fromIndex: 0, toIndex: 2,
    });
  });

  it('does NOT fire section.reorder when dropped index equals current index', () => {
    render(makeSection([], { label: 'S' }), { sectionIndex: 0 });
    const sectionEl = document.querySelector('.dynamic-section');
    fireEvent.drop(sectionEl, {
      dataTransfer: { getData: (k) => (k === 'application/sd-section' ? '0' : '') },
    });
    expect(onAction).not.toHaveBeenCalled();
  });

  it('does NOT fire section.reorder for an unparseable index', () => {
    render(makeSection([], { label: 'S' }), { sectionIndex: 1 });
    const sectionEl = document.querySelector('.dynamic-section');
    fireEvent.drop(sectionEl, {
      dataTransfer: { getData: (k) => (k === 'application/sd-section' ? 'abc' : '') },
    });
    expect(onAction).not.toHaveBeenCalled();
  });
});

describe('DynamicSection — field reorder drop', () => {
  it('fires field.reorder when a field is dropped onto a different field wrapper', () => {
    render(makeSection([makeField('a', 0), makeField('b', 1)]));
    // The second field wrapper is the reorder target (index 1)
    const wrappers = document.querySelectorAll('.dynamic-section__field-wrapper');
    fireEvent.drop(wrappers[1], {
      dataTransfer: {
        getData: (k) => (k === 'application/sd-field' ? '0' : ''),
      },
    });
    expect(onAction).toHaveBeenCalledWith('field.reorder', {
      tabIndex: 0, sectionIndex: 0, fromIndex: 0, toIndex: 1,
    });
  });

  it('does NOT fire field.reorder when from === to', () => {
    render(makeSection([makeField('a', 0), makeField('b', 1)]));
    const wrappers = document.querySelectorAll('.dynamic-section__field-wrapper');
    fireEvent.drop(wrappers[0], {
      dataTransfer: { getData: (k) => (k === 'application/sd-field' ? '0' : '') },
    });
    expect(onAction).not.toHaveBeenCalled();
  });
});

describe('DynamicSection — modal drag guard', () => {
  afterEach(() => {
    // Clean up any injected modal DOM
    document.querySelectorAll('.cds--modal.is-visible').forEach((el) => el.remove());
  });

  it('prevents dragStart on the section header when a modal is visible', () => {
    render(makeSection([], { label: 'X' }));
    // Inject a fake visible modal into the document body
    const fakeModal = document.createElement('div');
    fakeModal.className = 'cds--modal is-visible';
    document.body.appendChild(fakeModal);

    const header = document.querySelector('.dynamic-section__header');
    const mockPreventDefault = jest.fn();
    fireEvent.dragStart(header, {
      preventDefault: mockPreventDefault,
      dataTransfer: { setData: jest.fn(), effectAllowed: '' },
    });
    // Section drag should be blocked — onAction is definitely not called
    expect(onAction).not.toHaveBeenCalled();
  });
});

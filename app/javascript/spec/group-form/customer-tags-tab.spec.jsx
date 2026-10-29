import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import CustomerTagsTab from '../../components/group-form/customer-tags-tab';

jest.mock('../../components/expression-editor', () => {
  const MockExpressionEditor = ({ onQueryChange, onContextReady }) => (
    <div data-testid="expression-editor">
      <button
        type="button"
        onClick={() => onQueryChange(
          { rules: [{ field: '__tag__:managed/env', operator: 'CONTAINS', value: 'prod' }], combinator: 'and' },
          []
        )}
      >
        trigger valid
      </button>
      <button type="button" onClick={() => onQueryChange({ rules: [] }, ['incomplete'])}>trigger error</button>
      <button type="button" onClick={() => onContextReady && onContextReady(new Map(), null)}>trigger context</button>
    </div>
  );
  return MockExpressionEditor;
});

const emptyTags = { tags: [], assignedTags: [], affectedItems: [] };
const noop = () => {};

const defaultProps = {
  tags: emptyTags,
  assignedTags: [],
  onAssignedTagsChange: noop,
  useFilterExpression: false,
  onToggle: noop,
  onExpressionChange: noop,
  readOnly: false,
};

describe('CustomerTagsTab', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  describe('edit mode — tags', () => {
    it('renders the filter mode select defaulting to Specific Tags', () => {
      render(<CustomerTagsTab {...defaultProps} />);
      expect(screen.getByRole('combobox', { name: /this user is limited to/i })).toHaveValue('tags');
    });

    it('renders the TaggingEditor when in tags mode', () => {
      render(<CustomerTagsTab {...defaultProps} />);
      // TaggingEditor renders a grid wrapper
      expect(document.querySelector('.tagging-container')).toBeInTheDocument();
    });

    it('calls onToggle(true) when switching to expression mode', async() => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<CustomerTagsTab {...defaultProps} onToggle={onToggle} />);

      await user.selectOptions(
        screen.getByRole('combobox', { name: /this user is limited to/i }),
        'expression'
      );
      expect(onToggle).toHaveBeenCalledWith(true);
    });
  });

  describe('edit mode — expression', () => {
    const expressionProps = { ...defaultProps, useFilterExpression: true };

    it('renders the ExpressionEditor when in expression mode', () => {
      render(<CustomerTagsTab {...expressionProps} />);
      expect(screen.getByTestId('expression-editor')).toBeInTheDocument();
    });

    it('shows the "No filter expression defined" info notification when expression is empty', () => {
      render(<CustomerTagsTab {...expressionProps} />);
      expect(screen.getByText('No filter expression defined.')).toBeInTheDocument();
    });

    it('shows an error notification when the expression has validation errors', async() => {
      const user = userEvent.setup();
      render(<CustomerTagsTab {...expressionProps} onExpressionChange={noop} />);

      await user.click(screen.getByText('trigger error'));

      expect(screen.getByText('Expression incomplete')).toBeInTheDocument();
    });

    it('calls onExpressionChange with the query and errors', async() => {
      const onExpressionChange = jest.fn();
      const user = userEvent.setup();
      render(<CustomerTagsTab {...expressionProps} onExpressionChange={onExpressionChange} />);

      await user.click(screen.getByText('trigger valid'));

      expect(onExpressionChange).toHaveBeenCalledWith({ CONTAINS: { tag: 'managed/env', value: 'prod' } }, []);
    });

    it('calls onToggle(false) when switching back to tags mode', async() => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<CustomerTagsTab {...expressionProps} onToggle={onToggle} />);

      await user.selectOptions(
        screen.getByRole('combobox', { name: /this user is limited to/i }),
        'tags'
      );
      expect(onToggle).toHaveBeenCalledWith(false);
    });
  });

  describe('parent reset (props restored)', () => {
    it('returns to tags mode without calling onToggle when the parent restores useFilterExpression=false', () => {
      const onToggle = jest.fn();
      const { rerender } = render(<CustomerTagsTab {...defaultProps} onToggle={onToggle} useFilterExpression />);
      expect(screen.getByTestId('expression-editor')).toBeInTheDocument();

      rerender(<CustomerTagsTab {...defaultProps} onToggle={onToggle} useFilterExpression={false} />);

      expect(screen.getByRole('combobox', { name: /this user is limited to/i })).toHaveValue('tags');
      expect(screen.queryByTestId('expression-editor')).not.toBeInTheDocument();
      expect(document.querySelector('.tagging-container')).toBeInTheDocument();
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('returns to expression mode without calling onToggle when the parent restores useFilterExpression=true', () => {
      const onToggle = jest.fn();
      const { rerender } = render(<CustomerTagsTab {...defaultProps} onToggle={onToggle} />);

      rerender(<CustomerTagsTab {...defaultProps} onToggle={onToggle} useFilterExpression />);

      expect(screen.getByRole('combobox', { name: /this user is limited to/i })).toHaveValue('expression');
      expect(screen.getByTestId('expression-editor')).toBeInTheDocument();
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('read-only mode — tags', () => {
    it('renders the limited-to-tags message', () => {
      render(<CustomerTagsTab {...defaultProps} readOnly />);
      expect(screen.getByText('This user is limited to items with the selected tags.')).toBeInTheDocument();
    });

    it('does not render the filter mode select', () => {
      render(<CustomerTagsTab {...defaultProps} readOnly />);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('read-only mode — expression', () => {
    it('renders the Filter Expression label', () => {
      render(<CustomerTagsTab {...defaultProps} readOnly useFilterExpression />);
      expect(screen.getByText('Filter Expression:')).toBeInTheDocument();
    });

    it('shows "No Filter Expression defined" when filterExpression is null', () => {
      render(<CustomerTagsTab {...defaultProps} readOnly useFilterExpression filterExpression={null} />);
      expect(screen.getByText('No Filter Expression defined')).toBeInTheDocument();
    });

    it('renders a human-readable expression summary when filterExpression is provided', async() => {
      const expr = { CONTAINS: { tag: 'managed/env', value: 'prod' } };
      fetchMock.get(
        /\/expression_editor\/tag_values/,
        { tag_values: [['Production', 'prod']] }
      );
      render(<CustomerTagsTab {...defaultProps} readOnly useFilterExpression filterExpression={expr} />);
      // The expression text is rendered in a <p>, not a <pre>
      await screen.findByText(/managed\/env contains 'Production'/i);
    });
  });
});

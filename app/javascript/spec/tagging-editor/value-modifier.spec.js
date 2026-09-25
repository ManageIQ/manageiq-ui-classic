import { render, screen } from '@testing-library/react';
import ValueModifier from '../../components/tagging-editor/value-modifier';

const selectedTagCategory = { label: 'Animal', id: '1' };
const tagValues = [
  { label: 'Duck', id: '1' },
  { label: 'Cat', id: '2' },
  { label: 'Dog', id: '3' },
];
const selectedTagValues = [{ label: 'Duck', id: '1' }];

describe('ValueModifier component', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ValueModifier
        selectedTagCategory={selectedTagCategory}
        onTagValueChange={jest.fn()}
        selectedTagValues={selectedTagValues}
        multiValue={false}
        values={tagValues}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the Value legend', () => {
    render(
      <ValueModifier
        selectedTagCategory={selectedTagCategory}
        onTagValueChange={jest.fn()}
        selectedTagValues={[]}
        values={tagValues}
      />
    );
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders a custom valueLabel', () => {
    render(
      <ValueModifier
        selectedTagCategory={selectedTagCategory}
        onTagValueChange={jest.fn()}
        selectedTagValues={[]}
        values={tagValues}
        valueLabel="Tag Value"
      />
    );
    expect(screen.getByText('Tag Value')).toBeInTheDocument();
  });
});

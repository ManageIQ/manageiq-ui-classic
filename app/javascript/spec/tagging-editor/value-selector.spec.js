import { render, screen } from '@testing-library/react';
import ValueSelector from '../../components/tagging-editor/value-selector';

const selectedTagCategory = { label: 'Comic Book Characters', id: '1' };
const tagValues = [
  { label: 'Asterix', id: '1' },
  { label: 'Obelix', id: '2' },
];
const selectedTagValues = [{ label: 'Obelix', id: '2' }];
const onChange = jest.fn();

describe('ValueSelector component', () => {
  it('matches snapshot with multi-select (default)', () => {
    const { container } = render(
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={selectedTagValues}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with single-select', () => {
    const { container } = render(
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={selectedTagValues}
        multiValue={false}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders MultiSelect when multiValue is true', () => {
    render(
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={[]}
        multiValue
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders Dropdown when multiValue is false', () => {
    render(
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={[]}
        multiValue={false}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows selected label for single-select', () => {
    render(
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={selectedTagValues}
        multiValue={false}
      />
    );
    expect(screen.getByText('Obelix')).toBeInTheDocument();
  });

  it('is disabled when isDisabled is true', () => {
    render(
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={[]}
        multiValue={false}
        isDisabled
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

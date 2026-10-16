import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tag from '../../components/tagging-editor/tag';

const tagCategory = { label: 'animal', id: '1' };
const tagValue = { label: 'duck', id: '1' };
const truncate = (str) => str;

describe('Tag component', () => {
  it('matches snapshot without close button', () => {
    const { container } = render(
      <Tag
        tagCategory={tagCategory}
        tagValue={tagValue}
        onTagDeleteClick={jest.fn()}
        truncate={truncate}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with close button', () => {
    const { container } = render(
      <Tag
        tagCategory={tagCategory}
        tagValue={tagValue}
        onTagDeleteClick={jest.fn()}
        truncate={truncate}
        showCloseButton
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('calls onTagDeleteClick with tagCategory and tagValue when close button clicked', async() => {
    const user = userEvent.setup();
    const onTagDeleteClick = jest.fn();
    render(
      <Tag
        tagCategory={tagCategory}
        tagValue={tagValue}
        onTagDeleteClick={onTagDeleteClick}
        truncate={truncate}
        showCloseButton
      />
    );

    await user.click(screen.getByRole('button'));
    expect(onTagDeleteClick).toHaveBeenCalledWith(tagCategory, tagValue);
  });

  it('renders the truncated label', () => {
    const truncateFn = (str) => str.substring(0, 3);
    render(
      <Tag
        tagCategory={tagCategory}
        tagValue={tagValue}
        onTagDeleteClick={jest.fn()}
        truncate={truncateFn}
      />
    );
    expect(screen.getByText('duc')).toBeInTheDocument();
  });
});

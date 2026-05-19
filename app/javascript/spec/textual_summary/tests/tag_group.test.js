import React from 'react';
import { render } from '@testing-library/react';
import TagGroup from '../../../components/textual_summary/tag_group';
import { tagGroupData } from '../data/tag_group';

describe('TagGroup', () => {
  /*
   *  has rows
   *    a) simple row
   *      has icon
   *      has value
   *    b) array row (multivalue)
   *      has icon
   *      values joined with "<b>&nbsp;|..."
   */
  it('renders just fine', () => {
    const { container } = render(
      <TagGroup items={tagGroupData.items} title={tagGroupData.title} />
    );
    expect(container).toMatchSnapshot();
  });

  it('rendered array row with icon and values joined with "<b>&nbsp;|&nbsp;</b>")', () => {
    const tagData = {
      items: [
        {
          label: 'My Company X Tags',
          value: [
            { icon: 'fa fa-tag', label: 'Dan Test', value: ['Test 1'] },
            { icon: 'fa fa-tag', label: 'Demo bla', value: ['Policy', '2'] },
          ],
          hoverClass: 'no-hover',
        },
      ],
      title: 'Smart Management',
    };

    const { container } = render(
      <TagGroup items={tagData.items} title={tagData.title} />
    );
    expect(container.innerHTML).toContain(
      '<div class="expand wrap_text">Policy\n2</div>'
    );
    expect(container.querySelector('i.fa.fa-tag')).toBeInTheDocument();
  });
});

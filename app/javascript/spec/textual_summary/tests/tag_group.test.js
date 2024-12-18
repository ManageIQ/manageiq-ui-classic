import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import TagGroup from '../../../components/textual_summary/tag_group';
import { tagGroupData } from '../data/tag_group';
import IconOrImage from '../../../components/textual_summary/icon_or_image';

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
    const image = mount(<TagGroup items={tagGroupData.items} title={tagGroupData.title} />);
    expect(toJson(image)).toMatchSnapshot();
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

    const wrapper = mount(<TagGroup items={tagData.items} title={tagData.title} />);
    expect(wrapper.html()).toContain('<div class="expand wrap_text">Policy\n2</div>');
    expect(wrapper.containsMatchingElement(<i className="fa fa-tag" />)).toEqual(true);
  });
});

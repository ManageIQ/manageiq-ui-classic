import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import IconOrImage from '../../../components/textual_summary/icon_or_image';

describe('Icon or Image', () => {
  it('renders image with title and alt if image is passed in', () => {
    const image = mount(<IconOrImage image="foo/bar.png" title="foo bar title" />);
    expect(toJson(image)).toMatchSnapshot();
  });

  it('renders icon with title and alt if icon and no image are passed in', () => {
    const image = mount(<IconOrImage icon="fa fa-foobar" title="foo bar title" />);
    expect(toJson(image)).toMatchSnapshot();
  });

  it('renders nothing if no icon and no image are passed in', () => {
    const image = mount(<IconOrImage icon="" title="foo bar title" />);
    expect(toJson(image)).toMatchSnapshot();
  });

  it('renders icon with background', () => {
    const image = mount(<IconOrImage icon="fa fa-foobar" title="foo bar title" background="blue" />);
    expect(toJson(image)).toMatchSnapshot();
  });
});

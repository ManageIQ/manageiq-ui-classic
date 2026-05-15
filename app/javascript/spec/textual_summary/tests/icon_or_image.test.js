import React from 'react';
import { render } from '@testing-library/react';
import IconOrImage from '../../../components/textual_summary/icon_or_image';

describe('Icon or Image', () => {
  it('renders image with title and alt if image is passed in', () => {
    const { container } = render(
      <IconOrImage image="foo/bar.png" title="foo bar title" />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders icon with title and alt if icon and no image are passed in', () => {
    const { container } = render(
      <IconOrImage icon="fa fa-foobar" title="foo bar title" />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders nothing if no icon and no image are passed in', () => {
    const { container } = render(<IconOrImage icon="" title="foo bar title" />);
    expect(container).toMatchSnapshot();
  });

  it('renders icon with background', () => {
    const { container } = render(
      <IconOrImage
        icon="fa fa-foobar"
        title="foo bar title"
        background="blue"
      />
    );
    expect(container).toMatchSnapshot();
  });
});

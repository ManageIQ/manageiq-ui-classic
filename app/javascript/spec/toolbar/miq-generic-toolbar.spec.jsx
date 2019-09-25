import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import { MiqGenericToolbar } from '../../components/miq-toolbar';

const genericTbProps = {
  toolbars: [
    [
      {
        id: 'summary_reload',
        type: 'button',
        icon: 'fa fa-refresh fa-lg',
        name: 'summary_reload',
        title: 'Refresh this page',
      },
    ],
  ],
};

describe('<MiqGenericToolbar />', () => {
  it('renders ok', () => {
    const t = mount(<MiqGenericToolbar {...genericTbProps} />);
    expect(toJson(t)).toMatchSnapshot();
  });
});

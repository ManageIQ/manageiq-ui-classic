import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';

import { Quadicon } from '../../../components/quadicon';
import {
  quads, numbers, piecharts, hosts, vms, containerproviders,
} from '../data/quadicons';

/* eslint no-bitwise: ["error", { "allow": ["^", ">>>"] }], react/jsx-closing-tag-location: ["off"] */

const hObj = (obj) => {
  const s = JSON.stringify(obj);
  let h = 1;
  for (let i = 0; i < s.length; i += 1) {
    h = Math.imul(h ^ s.charCodeAt(i), 951274213);
  }
  return (h ^ h >>> 9) >>> 0;
};

describe('Quadicon', () => {
  it('renders just fine...', () => {
    const all = [...quads, ...numbers, ...piecharts, ...hosts, ...vms, ...containerproviders];
    const qs = mount(<>
      { all.map((quad) => <Quadicon key={hObj(quad)} data={quad} />)}
    </>);
    expect(toJson(qs)).toMatchSnapshot();
  });
});

import { define } from '../../miq-component/registry.js';
import { cleanVirtualDom } from '../../miq-component/helpers';

describe('Helpers', () => {
  it('Should call instance destroy method if component mounting element is missing', () => {
    const elemId = 'foo-component';

    const expectedElemet = document.createElement('div');
    expectedElemet.setAttribute('id', 'first');
    document.getElementsByTagName('body')[0].appendChild(expectedElemet);

    const destroy1 = jest.fn();
    const destroy2 = jest.fn();
    const testInstances = [
      {
        id: 'first',
        destroy: destroy1,
        elementId: 'first',

      }, {
        id: 'second',
        elementId: elemId,
        destroy: destroy2,
      },
    ];

    define('FooComponent', {}, { instances: testInstances });

    cleanVirtualDom();
    expect(destroy1).not.toHaveBeenCalled();
    expect(destroy2).toHaveBeenCalled();
  });
});

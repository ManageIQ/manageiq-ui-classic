import { spyOnDeeply } from './jest-mocks';

describe('Test helpers', () => {

  it('spyOnDeeply deep-clones mock function call arguments', () => {
    const object = {
      test(foo, bar) { return true; }
    };

    const mock = spyOnDeeply(object, 'test');
    expect(jest.isMockFunction(mock)).toBe(true);

    let fooArg = ['foo'];
    let barArg = { bar: true };

    expect(object.test(fooArg, barArg)).toBe(true);
    expect(mock).toHaveBeenCalledWith(
      ['foo'],
      { bar: true }
    );

    fooArg = 'foo';

    expect(object.test(fooArg, barArg)).toBe(true);
    expect(mock).toHaveBeenCalledWith(
      'foo',
      { bar: true }
    );
  });

});

import {
  getDefinition,
  sanitizeAndFreezeInstanceId,
  validateInstance,
  define,
  newInstance,
  getInstance,
  isDefined,
  getComponentNames,
  getComponentInstances,
  clearRegistry,
} from '../../miq-component/registry.js';


import {
  writeProxy,
  lockInstanceProperties,
} from '../../miq-component/utils.js';

describe('Component API', () => {
  let mountingElement;
  const mountId = 'mounting-point';

  beforeAll(() => {
    mountingElement = document.createElement('div');
    mountingElement.id = mountId;
    document.body.appendChild(mountingElement);
  });

  afterEach(() => {
    clearRegistry();
  });

  afterAll(() => {
    document.body.remove(mountingElement);
  });

  it('define method can be used to register new components', () => {
    define('FooComponent', {});
    define('BarComponent', {}, [{}]);
    expect(isDefined('FooComponent')).toBe(true);
    expect(isDefined('BarComponent')).toBe(true);
    expect(getComponentNames()).toEqual(['FooComponent', 'BarComponent']);
  });

  it('define method throws if the component name is already taken', () => {
    define('FooComponent', {});
    expect(() => {
      define('FooComponent', {});
    }).toThrow();
    expect(getComponentNames()).toEqual(['FooComponent']);
  });

  it('define method passes twice with override option', () => {
    define('FooComponent', {});
    define('FooComponent', {}, { override: true });
    expect(getComponentNames()).toEqual(['FooComponent']);
  });

  it('define method does nothing if the component name is not a string', () => {
    expect(() => {
      define(123, {});
    }).toThrow();
    expect(isDefined(123)).toBe(false);
    expect(getComponentNames()).toEqual([]);
  });

  it('define method can be used associate existing instances with the new component', () => {
    const testInstances = [
      { id: 'first' }, { id: 'second' },
    ];

    define('FooComponent', {}, { instances: testInstances });
    expect(getInstance('FooComponent', 'first')).toBe(testInstances[0]);
    expect(getInstance('FooComponent', 'second')).toBe(testInstances[1]);
  });

  it('when passing existing instances, define method ensures a sane instance id', () => {
    const testInstances = [
      { id: 'first' }, { id: 123 }, {},
    ];

    define('FooComponent', {}, { instances: testInstances });

    const registeredInstances = getComponentInstances('FooComponent');
    expect(registeredInstances).toHaveLength(3);
    expect(registeredInstances[0].id).toBe('first');
    expect(registeredInstances[1].id).toBe('FooComponent-1');
    expect(registeredInstances[2].id).toBe('FooComponent-2');
  });

  it('when passing existing instances, define method ensures that instance id is frozen', () => {
    const testInstances = [
      { id: 'first' },
    ];

    define('FooComponent', {}, { instances: testInstances });
    expect(() => {
      testInstances[0].id = 'second';
    }).toThrow();
  });

  it('when passing existing instances, define method skips falsy values', () => {
    const testInstances = [
      false, '', null, undefined, {},
    ];

    define('FooComponent', {}, { instances: testInstances });

    const registeredInstances = getComponentInstances('FooComponent');
    expect(registeredInstances).toHaveLength(1);
    expect(registeredInstances[0].id).toBe('FooComponent-0');
  });

  it('when passing existing instances, define method throws in case of reference duplicity', () => {
    const testInstance = { id: 'first' };

    expect(() => {
      define('FooComponent', {}, { instances: [testInstance, testInstance] });
    }).toThrow();
  });

  it('when passing existing instances, define method throws in case of id duplicity', () => {
    const testInstances = [
      { id: 'first' }, { id: 'first' },
    ];

    expect(() => {
      define('FooComponent', {}, { instances: testInstances });
    }).toThrow();
  });

  it('newInstance method can be used to create new component instances', () => {
    const testInstances = [
      { id: 'first', elementId: mountId }, { id: 'second', elementId: mountId },
    ];

    const testBlueprint = {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => testInstances[0])
        .mockImplementationOnce(() => testInstances[1]),
    };

    define('FooComponent', testBlueprint);
    const resultingInstances = [
      newInstance('FooComponent', { bar: 123 }, mountingElement),
      newInstance('FooComponent', { baz: true }, mountingElement),
    ];

    expect(testBlueprint.create).toHaveBeenCalledTimes(2);
    expect(testBlueprint.create.mock.calls[0]).toEqual([
      { bar: 123 },
      mountingElement,
    ]);
    expect(testBlueprint.create.mock.calls[1]).toEqual([
      { baz: true },
      mountingElement,
    ]);

    expect(resultingInstances[0]).toBe(testInstances[0]);
    expect(resultingInstances[1]).toBe(testInstances[1]);

    expect(resultingInstances[0].id).toBe('first');
    expect(resultingInstances[1].id).toBe('second');

    expect(resultingInstances[0].props).toEqual({ bar: 123 });
    expect(resultingInstances[1].props).toEqual({ baz: true });

    resultingInstances.forEach((instance) => {
      expect(instance.update).toEqual(expect.any(Function));
      expect(instance.destroy).toEqual(expect.any(Function));
    });

    const registeredInstances = getComponentInstances('FooComponent');
    expect(registeredInstances).toHaveLength(2);
    expect(registeredInstances[0]).toBe(resultingInstances[0]);
    expect(registeredInstances[1]).toBe(resultingInstances[1]);
  });

  it('newInstance method does nothing if the component is not already defined', () => {
    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(resultingInstance).toBeUndefined();
  });

  it('newInstance method does nothing if blueprint.create is not a function', () => {
    define('FooComponent', {});

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(resultingInstance).toBeUndefined();
  });

  it('newInstance method throws if blueprint.create returns a falsy value', () => {
    define('FooComponent', {
      create() { return null; },
    });

    expect(() => {
      newInstance('FooComponent', { bar: 123 });
    }).toThrow();
  });

  it('newInstance method ensures a sane instance id', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => ({ id: 'first', elementId: mountId }))
        .mockImplementationOnce(() => ({ id: 123, elementId: mountId }))
        .mockImplementationOnce(() => ({ elementId: mountId })),
    });

    const resultingInstances = [
      newInstance('FooComponent', { bar: 123, elementId: mountId }, mountingElement),
      newInstance('FooComponent', { baz: true, elementId: mountId }, mountingElement),
      newInstance('FooComponent', { qux: ['1337'], elementId: mountId }, mountingElement),
    ];

    expect(resultingInstances[0].id).toBe('first');
    expect(resultingInstances[1].id).toBe('FooComponent-1');
    expect(resultingInstances[2].id).toBe('FooComponent-2');
  });

  it('newInstance method ensures that instance id is frozen', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => ({ id: 'first' })),
    });

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(() => {
      resultingInstance.id = 'second';
    }).toThrow();
  });

  it('newInstance method throws if blueprint.create returns the same instance', () => {
    const testInstance = { id: 'first' };

    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => testInstance)
        .mockImplementationOnce(() => testInstance),
    });

    newInstance('FooComponent', { bar: 123 });

    expect(() => {
      newInstance('FooComponent', { bar: 123 });
    }).toThrow();
  });

  it('newInstance method throws if blueprint.create returns an instance with id already taken', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => ({ id: 'first', elementId: mountId }))
        .mockImplementationOnce(() => ({ id: 'first', elementId: mountId })),
    });
    newInstance('FooComponent', { bar: 123 }, mountingElement);
    expect(() => {
      newInstance('FooComponent', { bar: 123 }, mountingElement);
    }).toThrow();
  });

  it('trying to rewrite instance props throws an error', () => {
    define('FooComponent', {
      create() { return {}; },
    });

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(() => {
      resultingInstance.props = {};
    }).toThrow();
  });

  it('instance.update merges props and delegates to blueprint.update', () => {
    const testInstances = [
      { id: 'first', elementId: mountId }, { id: 'second', elementId: mountId },
    ];

    const testBlueprint = {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => testInstances[0])
        .mockImplementationOnce(() => testInstances[1]),
      update: jest.fn().mockName('testBlueprint.update'),
    };

    define('UpdateComponent', testBlueprint);

    const resultingInstances = [
      newInstance('UpdateComponent', { bar: 123 }, mountingElement),
      newInstance('UpdateComponent', { baz: true }, mountingElement),
    ];

    resultingInstances[0].update({ baz: true, qux: ['1337'] });
    resultingInstances[1].update({ baz: false });

    expect(testBlueprint.update).toHaveBeenCalledTimes(2);
    expect(testBlueprint.update.mock.calls[0]).toEqual([
      { bar: 123, baz: true, qux: ['1337'] },
      mountingElement,
    ]);

    expect(resultingInstances[0].props).toEqual({
      bar: 123, baz: true, qux: ['1337'],
    });
    expect(resultingInstances[1].props).toEqual({
      baz: false,
    });
  });

  it('instance.update does nothing if blueprint.update is not a function', () => {
    define('FooComponent', {
      create() { return {}; },
    });

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.update({ baz: true, qux: ['1337'] });

    expect(resultingInstance.props).toEqual({ bar: 123 });
  });

  it('multiple props modifications will trigger single instance.update', (done) => {
    const testBlueprint = {
      create() { return {}; },
      update: jest.fn().mockName('testBlueprint.update'),
    };

    define('FooComponent', testBlueprint);

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.update = jest.fn().mockName('resultingInstance.update');

    resultingInstance.props.baz = true;
    resultingInstance.props.qux = ['1337'];

    setTimeout(() => {
      expect(resultingInstance.update).toHaveBeenCalledWith({ baz: true, qux: ['1337'] });
      done();
    });
  });

  it('instance.destroy delegates to blueprint.destroy', () => {
    const testInstances = [
      { id: 'first', elementId: mountId }, { id: 'second', elementId: mountId },
    ];

    const testBlueprint = {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => testInstances[0])
        .mockImplementationOnce(() => testInstances[1]),
      destroy: jest.fn().mockName('testBlueprint.destroy'),
      elementId: mountId,
    };

    define('FooComponent', testBlueprint);

    const resultingInstances = [
      newInstance('FooComponent', { bar: 123 }, mountingElement),
      newInstance('FooComponent', { baz: true }),
    ];

    resultingInstances[0].destroy();
    resultingInstances[1].destroy();

    expect(testBlueprint.destroy).toHaveBeenCalledTimes(2);
    expect(testBlueprint.destroy.mock.calls[0]).toEqual([
      resultingInstances[0],
      mountingElement,
    ]);
    expect(testBlueprint.destroy.mock.calls[0][0]).toBe(resultingInstances[0]);
    expect(testBlueprint.destroy.mock.calls[1]).toEqual([
      resultingInstances[1],
      undefined,
    ]);
    expect(testBlueprint.destroy.mock.calls[1][0]).toBe(resultingInstances[1]);
  });

  it('instance.destroy removes the component instance', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => ({ id: 'first' })),
    });

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.destroy();

    expect(getInstance('FooComponent', 'first')).toBeUndefined();
    expect(getComponentInstances('FooComponent')).toEqual([]);
  });

  it('instance.destroy prevents access to existing instance properties except for id', () => {
    define('FooComponent', {
      create() { return {}; },
    });

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.destroy();

    Object.keys(resultingInstance)
      .filter(propName => propName !== 'id')
      .forEach((propName) => {
        expect(() => resultingInstance[propName]).toThrow();
        expect(() => {
          resultingInstance[propName] = ['1337'];
        }).toThrow();
      });
  });

  it('getInstance method can be used to obtain existing component instances', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => ({ id: 'first' })),
    });

    const resultingInstance = newInstance('FooComponent', { bar: 123 });
    const obtainedInstance = getInstance('FooComponent', 'first');
    expect(obtainedInstance).toBe(resultingInstance);
    expect(getInstance('FooComponent', 'second')).toBeUndefined();
  });

  it('isDefined method can be used to determine whether a component is already defined', () => {
    define('FooComponent', {});
    expect(isDefined('FooComponent')).toBe(true);
    expect(isDefined('BarComponent')).toBe(false);
  });

  it('getDefinition returns the correct component definition', () => {
    const testBlueprint = {};
    define('FooComponent', testBlueprint);

    const definition = getDefinition('FooComponent');
    expect(definition.name).toBe('FooComponent');
    expect(definition.blueprint).toBe(testBlueprint);

    expect(getDefinition('BarComponent')).toBeUndefined();
  });

  it('sanitizeAndFreezeInstanceId ensures the instance id is sane and cannot be changed', () => {
    const testInstances = [
      { id: 'first' }, { id: 123 }, {},
    ];

    define('FooComponent', {});
    const definition = getDefinition('FooComponent');

    testInstances.forEach((instance) => {
      sanitizeAndFreezeInstanceId(instance, definition);
    });

    expect(testInstances[0].id).toBe('first');
    expect(testInstances[1].id).toBe('FooComponent-0');
    expect(testInstances[2].id).toBe('FooComponent-0');

    testInstances.forEach((instance) => {
      expect(() => {
        instance.id = 'second'; // eslint-disable-line no-param-reassign, param reassing this is expected to fail, therefore eslint rule here does not make sense
      }).toThrow();
    });
  });

  it('validateInstance performs the necessary instance validations', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
        .mockImplementationOnce(() => ({ id: 'first' })),
    });

    const firstInstance = newInstance('FooComponent', { bar: 123 });
    const definition = getDefinition('FooComponent');

    expect(() => {
      validateInstance({ id: 'second' }, definition);
    }).not.toThrow();

    expect(() => {
      validateInstance(firstInstance, definition);
    }).toThrow();

    expect(() => {
      validateInstance({ id: 'first' }, definition);
    }).toThrow();
  });

  it('writeProxy can be used to proxy writes to properties of the given object', () => {
    const object = { bar: 123, baz: true };
    const onWrite = jest.fn().mockName('onWrite');

    const resultingObject = writeProxy(object, onWrite);
    expect(resultingObject).toEqual(object);

    resultingObject.bar = 456;
    resultingObject.qux = ['1337'];

    expect(resultingObject).toEqual(object);
    expect(object).toEqual({ bar: 456, baz: true, qux: ['1337'] });

    expect(onWrite).toHaveBeenCalledTimes(2);
    expect(onWrite.mock.calls[0]).toEqual([
      'bar', 456,
    ]);
    expect(onWrite.mock.calls[1]).toEqual([
      'qux', ['1337'],
    ]);
  });

  it('lockInstanceProperties prevents access to existing instance properties except for id', () => {
    const testInstance = { id: 'first', bar: 123, baz: true };

    const resultingInstance = lockInstanceProperties(testInstance);
    expect(resultingInstance.id).toBe('first');

    ['bar', 'baz'].forEach((propName) => {
      expect(() => resultingInstance[propName]).toThrow();
      expect(() => {
        resultingInstance[propName] = ['1337'];
      }).toThrow();
    });
  });
});

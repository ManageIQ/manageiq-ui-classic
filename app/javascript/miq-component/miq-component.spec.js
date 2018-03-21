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
  clearRegistry
} from './registry';

import {
  writeProxy,
  lockInstanceProperties
} from './utils';

describe('Component API', () => {
  afterEach(() => {
    clearRegistry();
  });

  it('define method can be used to register new components', () => {
    define('FooComponent', {});
    define('BarComponent', {}, [{}]);
    expect(isDefined('FooComponent')).toBe(true);
    expect(isDefined('BarComponent')).toBe(true);
    expect(getComponentNames()).toEqual(['FooComponent', 'BarComponent']);
  });

  it('define method does nothing if the component name is already taken', () => {
    define('FooComponent', {});
    define('FooComponent', {});
    expect(getComponentNames()).toEqual(['FooComponent']);
  });

  it('define method does nothing if the component name is not a string', () => {
    define(123, {});
    expect(isDefined(123)).toBe(false);
    expect(getComponentNames()).toEqual([]);
  });

  it('define method can be used associate existing instances with the new component', () => {
    var testInstances = [
      { id: 'first' }, { id: 'second' }
    ];

    define('FooComponent', {}, testInstances);
    expect(getInstance('FooComponent', 'first')).toBe(testInstances[0]);
    expect(getInstance('FooComponent', 'second')).toBe(testInstances[1]);
  });

  it('when passing existing instances, define method ensures a sane instance id', () => {
    var testInstances = [
      { id: 'first' }, { id: 123 }, {}
    ];

    define('FooComponent', {}, testInstances);

    var registeredInstances = getComponentInstances('FooComponent');
    expect(registeredInstances.length).toBe(3);
    expect(registeredInstances[0].id).toBe('first');
    expect(registeredInstances[1].id).toBe('FooComponent-1');
    expect(registeredInstances[2].id).toBe('FooComponent-2');
  });

  it('when passing existing instances, define method ensures that instance id is frozen', () => {
    var testInstances = [
      { id: 'first' }
    ];

    define('FooComponent', {}, testInstances);
    expect(() => {
      testInstances[0].id = 'second';
    }).toThrow();
  });

  it('when passing existing instances, define method skips falsy values', () => {
    var testInstances = [
      false, '', null, undefined, {}
    ];

    define('FooComponent', {}, testInstances);

    var registeredInstances = getComponentInstances('FooComponent');
    expect(registeredInstances.length).toBe(1);
    expect(registeredInstances[0].id).toBe('FooComponent-0');
  });

  it('when passing existing instances, define method throws in case of reference duplicity', () => {
    var testInstance = { id: 'first' };

    expect(() => {
      define('FooComponent', {}, [testInstance, testInstance]);
    }).toThrow();
  });

  it('when passing existing instances, define method throws in case of id duplicity', () => {
    var testInstances = [
      { id: 'first' }, { id: 'first' }
    ];

    expect(() => {
      define('FooComponent', {}, testInstances);
    }).toThrow();
  });

  it('newInstance method can be used to create new component instances', () => {
    var testInstances = [
      { id: 'first' }, { id: 'second' }
    ];

    var testBlueprint = {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => testInstances[0])
                .mockImplementationOnce(() => testInstances[1])
    };

    define('FooComponent', testBlueprint);

    var mountFirstInstanceTo = document.createElement('div');
    var resultingInstances = [
      newInstance('FooComponent', { bar: 123 }, mountFirstInstanceTo),
      newInstance('FooComponent', { baz: true })
    ];

    expect(testBlueprint.create).toHaveBeenCalledTimes(2);
    expect(testBlueprint.create.mock.calls[0]).toEqual([
      { bar: 123 },
      mountFirstInstanceTo
    ]);
    expect(testBlueprint.create.mock.calls[1]).toEqual([
      { baz: true },
      undefined
    ]);

    expect(resultingInstances[0]).toBe(testInstances[0]);
    expect(resultingInstances[1]).toBe(testInstances[1]);

    expect(resultingInstances[0].id).toBe('first');
    expect(resultingInstances[1].id).toBe('second');

    expect(resultingInstances[0].props).toEqual({ bar: 123 });
    expect(resultingInstances[1].props).toEqual({ baz: true });

    resultingInstances.forEach(instance => {
      expect(instance.update).toEqual(expect.any(Function));
      expect(instance.destroy).toEqual(expect.any(Function));
    });

    var registeredInstances = getComponentInstances('FooComponent');
    expect(registeredInstances.length).toBe(2);
    expect(registeredInstances[0]).toBe(resultingInstances[0]);
    expect(registeredInstances[1]).toBe(resultingInstances[1]);
  });

  it('newInstance method does nothing if the component is not already defined', () => {
    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(resultingInstance).toBeUndefined();
  });

  it('newInstance method does nothing if blueprint.create is not a function', () => {
    define('FooComponent', {});

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(resultingInstance).toBeUndefined();
  });

  it('newInstance method throws if blueprint.create returns a falsy value', () => {
    define('FooComponent', {
      create() { return null; }
    });

    expect(() => {
      newInstance('FooComponent', { bar: 123 });
    }).toThrow();
  });

  it('newInstance method ensures a sane instance id', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => ({ id: 'first' }))
                .mockImplementationOnce(() => ({ id: 123 }))
                .mockImplementationOnce(() => ({}))
    });

    var resultingInstances = [
      newInstance('FooComponent', { bar: 123 }),
      newInstance('FooComponent', { baz: true }),
      newInstance('FooComponent', { qux: ['1337'] })
    ];

    expect(resultingInstances[0].id).toBe('first');
    expect(resultingInstances[1].id).toBe('FooComponent-1');
    expect(resultingInstances[2].id).toBe('FooComponent-2');
  });

  it('newInstance method ensures that instance id is frozen', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => ({ id: 'first' }))
    });

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(() => {
      resultingInstance.id = 'second';
    }).toThrow();
  });

  it('newInstance method throws if blueprint.create returns the same instance', () => {
    var testInstance = { id: 'first' };

    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => testInstance)
                .mockImplementationOnce(() => testInstance)
    });

    newInstance('FooComponent', { bar: 123 });

    expect(() => {
      newInstance('FooComponent', { bar: 123 });
    }).toThrow();
  });

  it('newInstance method throws if blueprint.create returns an instance with id already taken', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => ({ id: 'first' }))
                .mockImplementationOnce(() => ({ id: 'first' }))
    });

    newInstance('FooComponent', { bar: 123 });

    expect(() => {
      newInstance('FooComponent', { bar: 123 });
    }).toThrow();
  });

  it('trying to rewrite instance props throws an error', () => {
    define('FooComponent', {
      create() { return {}; }
    });

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    expect(() => {
      resultingInstance.props = {};
    }).toThrow();
  });

  it('instance.update merges props and delegates to blueprint.update', () => {
    var testBlueprint = {
      create() { return {}; },
      update: jest.fn().mockName('testBlueprint.update')
    };

    define('FooComponent', testBlueprint);

    var mountFirstInstanceTo = document.createElement('div');
    var resultingInstances = [
      newInstance('FooComponent', { bar: 123 }, mountFirstInstanceTo),
      newInstance('FooComponent', { baz: true })
    ];

    resultingInstances[0].update({ baz: true, qux: ['1337'] });
    resultingInstances[1].update({ baz: false });

    expect(testBlueprint.update).toHaveBeenCalledTimes(2);
    expect(testBlueprint.update.mock.calls[0]).toEqual([
      { bar: 123, baz: true, qux: ['1337'] },
      mountFirstInstanceTo
    ]);
    expect(testBlueprint.update.mock.calls[1]).toEqual([
      { baz: false },
      undefined
    ]);

    expect(resultingInstances[0].props).toEqual({
      bar: 123, baz: true, qux: ['1337']
    });
    expect(resultingInstances[1].props).toEqual({
      baz: false
    });
  });

  it('instance.update does nothing if blueprint.update is not a function', () => {
    define('FooComponent', {
      create() { return {}; }
    });

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.update({ baz: true, qux: ['1337'] });

    expect(resultingInstance.props).toEqual({ bar: 123 });
  });

  it('multiple props modifications will trigger single instance.update', (done) => {
    var testBlueprint = {
      create() { return {}; },
      update: jest.fn().mockName('testBlueprint.update')
    };

    define('FooComponent', testBlueprint);

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.update = jest.fn().mockName('resultingInstance.update');

    resultingInstance.props.baz = true;
    resultingInstance.props.qux = ['1337'];

    setTimeout(() => {
      expect(resultingInstance.update).toHaveBeenCalledWith(
        { baz: true, qux: ['1337'] }
      );
      done();
    });
  });

  it('instance.destroy delegates to blueprint.destroy', () => {
    var testBlueprint = {
      create() { return {}; },
      destroy: jest.fn().mockName('testBlueprint.destroy')
    };

    define('FooComponent', testBlueprint);

    var mountFirstInstanceTo = document.createElement('div');
    var resultingInstances = [
      newInstance('FooComponent', { bar: 123 }, mountFirstInstanceTo),
      newInstance('FooComponent', { baz: true })
    ];

    resultingInstances[0].destroy();
    resultingInstances[1].destroy();

    expect(testBlueprint.destroy).toHaveBeenCalledTimes(2);
    expect(testBlueprint.destroy.mock.calls[0]).toEqual([
      resultingInstances[0],
      mountFirstInstanceTo
    ]);
    expect(testBlueprint.destroy.mock.calls[0][0]).toBe(resultingInstances[0]);
    expect(testBlueprint.destroy.mock.calls[1]).toEqual([
      resultingInstances[1],
      undefined
    ]);
    expect(testBlueprint.destroy.mock.calls[1][0]).toBe(resultingInstances[1]);
  });

  it('instance.destroy removes the component instance', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => ({ id: 'first' }))
    });

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.destroy();

    expect(getInstance('FooComponent', 'first')).toBeUndefined();
    expect(getComponentInstances('FooComponent')).toEqual([]);
  });

  it('instance.destroy prevents access to existing instance properties except for id', () => {
    define('FooComponent', {
      create() { return {}; }
    });

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    resultingInstance.destroy();

    Object.keys(resultingInstance)
      .filter(propName => propName !== 'id')
      .forEach(propName => {
        expect(() => {
          resultingInstance[propName];
        }).toThrow();
        expect(() => {
          resultingInstance[propName] = ['1337'];
        }).toThrow();
      });
  });

  it('getInstance method can be used to obtain existing component instances', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => ({ id: 'first' }))
    });

    var resultingInstance = newInstance('FooComponent', { bar: 123 });
    var obtainedInstance = getInstance('FooComponent', 'first');
    expect(obtainedInstance).toBe(resultingInstance);
    expect(getInstance('FooComponent', 'second')).toBeUndefined();
  });

  it('isDefined method can be used to determine whether a component is already defined', () => {
    define('FooComponent', {});
    expect(isDefined('FooComponent')).toBe(true);
    expect(isDefined('BarComponent')).toBe(false);
  });

  it('getDefinition returns the correct component definition', () => {
    var testBlueprint = {};
    define('FooComponent', testBlueprint);

    var definition = getDefinition('FooComponent');
    expect(definition.name).toBe('FooComponent');
    expect(definition.blueprint).toBe(testBlueprint);

    expect(getDefinition('BarComponent')).toBeUndefined();
  });

  it('sanitizeAndFreezeInstanceId ensures the instance id is sane and cannot be changed', () => {
    var testInstances = [
      { id: 'first' }, { id: 123 }, {}
    ];

    define('FooComponent', {});
    var definition = getDefinition('FooComponent');

    testInstances.forEach(instance => {
      sanitizeAndFreezeInstanceId(instance, definition);
    });

    expect(testInstances[0].id).toBe('first');
    expect(testInstances[1].id).toBe('FooComponent-0');
    expect(testInstances[2].id).toBe('FooComponent-0');

    testInstances.forEach(instance => {
      expect(() => {
        instance.id = 'second';
      }).toThrow();
    });
  });

  it('validateInstance performs the necessary instance validations', () => {
    define('FooComponent', {
      create: jest.fn().mockName('testBlueprint.create')
                .mockImplementationOnce(() => ({ id: 'first' }))
    });

    var firstInstance = newInstance('FooComponent', { bar: 123 });
    var definition = getDefinition('FooComponent');

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
    var object = { bar: 123, baz: true };
    var onWrite = jest.fn().mockName('onWrite');

    var resultingObject = writeProxy(object, onWrite);
    expect(resultingObject).toEqual(object);

    resultingObject.bar = 456;
    resultingObject.qux = ['1337'];

    expect(resultingObject).toEqual(object);
    expect(object).toEqual({ bar: 456, baz: true, qux: ['1337'] });

    expect(onWrite).toHaveBeenCalledTimes(2);
    expect(onWrite.mock.calls[0]).toEqual([
      'bar', 456
    ]);
    expect(onWrite.mock.calls[1]).toEqual([
      'qux', ['1337']
    ]);
  });

  it('lockInstanceProperties prevents access to existing instance properties except for id', () => {
    var testInstance = { id: 'first', bar: 123, baz: true };

    var resultingInstance = lockInstanceProperties(testInstance);
    expect(resultingInstance.id).toBe('first');

    ['bar', 'baz'].forEach(propName => {
      expect(() => {
        resultingInstance[propName];
      }).toThrow();
      expect(() => {
        resultingInstance[propName] = ['1337'];
      }).toThrow();
    });
  });
});

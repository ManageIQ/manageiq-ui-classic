import { trimFieldValue } from '../../components/provider-form/helper';

describe('trimFieldValue function', () => {
  it('should trim the hostname field', () => {
    const resource = {
      hostname: '  example.com  ',
      otherField: 'value',
    };

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource.hostname).toEqual('example.com');
    expect(trimmedResource.otherField).toEqual('value');
  });

  it('should handle nested objects and trim the hostname field', () => {
    const resource = {
      nestedObject: {
        hostname: '  nested-example.com  ',
      },
      otherField: 'value',
    };

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource.nestedObject.hostname).toEqual('nested-example.com');
    expect(trimmedResource.otherField).toEqual('value');
  });

  it('should handle multiple nested objects and trim the hostname field', () => {
    const resource = {
      firstLevel: {
        nestedObject: {
          hostname: '  nested-example.com  ',
        },
      },
      otherField: 'value',
    };

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource.firstLevel.nestedObject.hostname).toEqual('nested-example.com');
    expect(trimmedResource.otherField).toEqual('value');
  });

  it('should handle undefined values', () => {
    const resource = {
      hostname: undefined,
    };

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource.hostname).toEqual('');
  });

  it('should handle null values', () => {
    const resource = {
      hostname: null,
    };

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource.hostname).toEqual('');
  });

  it('should not modify non-trimmed fields', () => {
    const resource = {
      username: 'user123',
      email: 'user@example.com',
    };

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource.username).toEqual('user123');
    expect(trimmedResource.email).toEqual('user@example.com');
  });

  it('should handle non-object values', () => {
    const resource = 'Hello';

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource).toEqual('Hello');
  });

  it('should handle non-object values inside an array', () => {
    const resource = ['  example.com  ', '  nested-example.com  ', { hostname: '  test   ' }];

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource).toEqual(['  example.com  ', '  nested-example.com  ', { hostname: 'test' }]);
  });

  it('should handle objects nested inside an array', () => {
    const resource = {
      otherField: '  example.com  ',
      otherField2: [
        {
          firstLevel: {
            nestedObject: {
              hostname: '  nested-example.com  ',
            },
          },
          nestedField: 'value',
        },
      ],
    };

    const trimmedResource = trimFieldValue(resource);

    expect(trimmedResource).toEqual({
      otherField: '  example.com  ',
      otherField2: [
        {
          firstLevel: {
            nestedObject: {
              hostname: 'nested-example.com',
            },
          },
          nestedField: 'value',
        },
      ],
    });
  });
});

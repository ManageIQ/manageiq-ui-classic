/**
 * Tests for credential utility functions
 */

import { extractCredentialReference, parseWorkflowCredentials, isValidCredentialReference } from './credential-utils';

describe('extractCredentialReference', () => {
  it('should extract credential reference from dot notation', () => {
    expect(extractCredentialReference('$$.Credentials.my_ssh_credential')).toBe('my_ssh_credential');
    expect(extractCredentialReference('$$.Credentials.api_token')).toBe('api_token');
    expect(extractCredentialReference('$$.Credentials.database-cred')).toBe('database-cred');
  });

  it('should extract credential reference from bracket notation', () => {
    expect(extractCredentialReference("$$['Credentials']['my_ssh_credential']")).toBe('my_ssh_credential');
    expect(extractCredentialReference("$$['Credentials']['api_token']")).toBe('api_token');
  });

  it('should return null for invalid formats', () => {
    expect(extractCredentialReference('invalid')).toBeNull();
    expect(extractCredentialReference('$$.SomethingElse.credential')).toBeNull();
    expect(extractCredentialReference('$.Credentials.credential')).toBeNull();
    expect(extractCredentialReference('')).toBeNull();
  });

  it('should return null for non-string values', () => {
    expect(extractCredentialReference(null)).toBeNull();
    expect(extractCredentialReference(undefined)).toBeNull();
    expect(extractCredentialReference(123)).toBeNull();
    expect(extractCredentialReference({})).toBeNull();
  });
});

describe('parseWorkflowCredentials', () => {
  it('should parse credentials from a valid payload with dot notation', () => {
    const payload = JSON.stringify({
      States: {
        ExecuteScript: {
          Credentials: {
            ssh_cred: '$$.Credentials.my_ssh_credential',
            api_token: '$$.Credentials.my_api_token',
          },
        },
      },
    });

    const result = parseWorkflowCredentials(payload);
    
    expect(result).toEqual({
      my_ssh_credential: '$$.Credentials.my_ssh_credential',
      my_api_token: '$$.Credentials.my_api_token',
    });
  });

  it('should parse credentials from a valid payload with bracket notation', () => {
    const payload = JSON.stringify({
      States: {
        ExecuteScript: {
          Credentials: {
            ssh_cred: "$$['Credentials']['my_ssh_credential']",
          },
        },
      },
    });

    const result = parseWorkflowCredentials(payload);
    
    expect(result).toEqual({
      my_ssh_credential: "$$['Credentials']['my_ssh_credential']",
    });
  });

  it('should parse credentials from multiple states', () => {
    const payload = JSON.stringify({
      States: {
        State1: {
          Credentials: {
            cred1: '$$.Credentials.credential_one',
          },
        },
        State2: {
          Credentials: {
            cred2: '$$.Credentials.credential_two',
          },
        },
      },
    });

    const result = parseWorkflowCredentials(payload);
    
    expect(result).toEqual({
      credential_one: '$$.Credentials.credential_one',
      credential_two: '$$.Credentials.credential_two',
    });
  });

  it('should handle states without credentials', () => {
    const payload = JSON.stringify({
      States: {
        State1: {
          Type: 'Task',
        },
        State2: {
          Credentials: {
            cred1: '$$.Credentials.my_credential',
          },
        },
      },
    });

    const result = parseWorkflowCredentials(payload);
    
    expect(result).toEqual({
      my_credential: '$$.Credentials.my_credential',
    });
  });

  it('should use placeholder name as fallback if JSONPath extraction fails', () => {
    const payload = JSON.stringify({
      States: {
        ExecuteScript: {
          Credentials: {
            plain_credential: 'some_non_jsonpath_value',
          },
        },
      },
    });

    const result = parseWorkflowCredentials(payload);
    
    expect(result).toEqual({
      plain_credential: 'some_non_jsonpath_value',
    });
  });

  it('should throw error for invalid JSON', () => {
    expect(() => {
      parseWorkflowCredentials('invalid json');
    }).toThrow('Failed to parse workflow payload');
  });

  it('should throw error for missing States property', () => {
    const payload = JSON.stringify({
      SomethingElse: {},
    });

    expect(() => {
      parseWorkflowCredentials(payload);
    }).toThrow('Invalid payload structure: missing or invalid States property');
  });

  it('should throw error for invalid States property', () => {
    const payload = JSON.stringify({
      States: 'not an object',
    });

    expect(() => {
      parseWorkflowCredentials(payload);
    }).toThrow('Invalid payload structure: missing or invalid States property');
  });

  it('should throw error when no credentials are found', () => {
    const payload = JSON.stringify({
      States: {
        State1: {
          Type: 'Task',
        },
      },
    });

    expect(() => {
      parseWorkflowCredentials(payload);
    }).toThrow('Workflow does not have any credentials to map');
  });

  it('should handle duplicate credential references (last one wins)', () => {
    const payload = JSON.stringify({
      States: {
        State1: {
          Credentials: {
            cred1: '$$.Credentials.shared_credential',
          },
        },
        State2: {
          Credentials: {
            cred2: '$$.Credentials.shared_credential',
          },
        },
      },
    });

    const result = parseWorkflowCredentials(payload);
    
    // Should only have one entry for shared_credential
    expect(Object.keys(result)).toHaveLength(1);
    expect(result.shared_credential).toBe('$$.Credentials.shared_credential');
  });
});

describe('isValidCredentialReference', () => {
  it('should return true for valid credential references', () => {
    expect(isValidCredentialReference('my_credential')).toBe(true);
    expect(isValidCredentialReference('credential-name')).toBe(true);
    expect(isValidCredentialReference('Credential123')).toBe(true);
    expect(isValidCredentialReference('a')).toBe(true);
  });

  it('should return false for invalid credential references', () => {
    expect(isValidCredentialReference('')).toBe(false);
    expect(isValidCredentialReference('has spaces')).toBe(false);
    expect(isValidCredentialReference('has.dots')).toBe(false);
    expect(isValidCredentialReference('has/slashes')).toBe(false);
    expect(isValidCredentialReference('has$pecial')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidCredentialReference(null)).toBe(false);
    expect(isValidCredentialReference(undefined)).toBe(false);
    expect(isValidCredentialReference(123)).toBe(false);
    expect(isValidCredentialReference({})).toBe(false);
  });
});

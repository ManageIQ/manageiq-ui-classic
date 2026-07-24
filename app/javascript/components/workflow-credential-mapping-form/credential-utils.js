/**
 * Utility functions for extracting and processing workflow credential references
 */

/**
 * Regular expressions for matching JSONPath credential references
 */
const JSONPATH_PATTERNS = {
  // Matches: $$.Credentials.my_credential_name
  DOT_NOTATION: /\$\$\.Credentials\.([a-zA-Z0-9_-]+)/,
  // Matches: $$['Credentials']['my_credential_name']
  BRACKET_NOTATION: /\$\$\['Credentials'\]\['([a-zA-Z0-9_-]+)'\]/,
};

/**
 * Extracts the credential reference name from a JSONPath value
 * Supports both dot notation ($$.Credentials.xxx) and bracket notation ($$['Credentials']['xxx'])
 * 
 * @param {string} value - The JSONPath string (e.g., "$$.Credentials.my_ssh_credential")
 * @returns {string|null} The extracted credential reference name, or null if not found
 * 
 * @example
 * extractCredentialReference("$$.Credentials.my_ssh_credential") // returns "my_ssh_credential"
 * extractCredentialReference("$$['Credentials']['my_api_token']") // returns "my_api_token"
 * extractCredentialReference("invalid") // returns null
 */
export const extractCredentialReference = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  // Try dot notation first (most common)
  const dotMatch = value.match(JSONPATH_PATTERNS.DOT_NOTATION);
  if (dotMatch && dotMatch[1]) {
    return dotMatch[1];
  }

  // Try bracket notation
  const bracketMatch = value.match(JSONPATH_PATTERNS.BRACKET_NOTATION);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1];
  }

  return null;
};

/**
 * Parses a workflow payload and extracts all credential references
 * 
 * @param {string} payload - JSON string containing the workflow definition
 * @returns {Object} Map of credential reference names to their JSONPath values
 * @throws {Error} If the payload is invalid or contains no credentials
 * 
 * @example
 * const payload = JSON.stringify({
 *   States: {
 *     ExecuteScript: {
 *       Credentials: {
 *         ssh_cred: "$$.Credentials.my_ssh_credential",
 *         api_token: "$$.Credentials.my_api_token"
 *       }
 *     }
 *   }
 * });
 * 
 * parseWorkflowCredentials(payload)
 * // Returns: {
 * //   my_ssh_credential: "$$.Credentials.my_ssh_credential",
 * //   my_api_token: "$$.Credentials.my_api_token"
 * // }
 */
export const parseWorkflowCredentials = (payload) => {
  // Parse the JSON payload
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payload);
  } catch (error) {
    throw new Error(`Failed to parse workflow payload: ${error.message}`);
  }

  // Validate the payload structure
  if (!parsedPayload.States || typeof parsedPayload.States !== 'object') {
    throw new Error('Invalid payload structure: missing or invalid States property');
  }

  const payloadCredentials = {};
  const jsonPayload = parsedPayload.States;

  // Iterate through all states in the workflow
  Object.values(jsonPayload).forEach((state) => {
    // Check if this state has credentials
    if (!state.Credentials || typeof state.Credentials !== 'object') {
      return;
    }

    // Process each credential in this state
    Object.entries(state.Credentials).forEach(([placeholderName, jsonPathValue]) => {
      // Extract the actual credential reference from the JSONPath value
      const credentialRef = extractCredentialReference(jsonPathValue);

      if (credentialRef) {
        // Use the extracted credential reference as the key
        payloadCredentials[credentialRef] = jsonPathValue;
      } else {
        // Fallback: if we can't extract a reference, use the placeholder name
        // This handles cases where the value might not be in JSONPath format
        payloadCredentials[placeholderName] = jsonPathValue;
      }
    });
  });

  // Validate that we found at least one credential
  if (Object.keys(payloadCredentials).length === 0) {
    throw new Error('Workflow does not have any credentials to map.');
  }

  return payloadCredentials;
};

/**
 * Validates that a credential reference name is valid
 * 
 * @param {string} credentialRef - The credential reference to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidCredentialReference = (credentialRef) => {
  if (typeof credentialRef !== 'string' || credentialRef.length === 0) {
    return false;
  }

  // Valid credential references should only contain alphanumeric characters, underscores, and hyphens
  return /^[a-zA-Z0-9_-]+$/.test(credentialRef);
};

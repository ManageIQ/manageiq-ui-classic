const BYTE_SUFFIXES = {
  bytes: 'Bytes',
  kilobytes: 'KB',
  megabytes: 'MB',
  gigabytes: 'GB',
  terabytes: 'TB',
};

export const quoteHuman = (value, colType) => {
  if (value === null || value === undefined) {
    return '""';
  }

  const str = String(value);

  // Byte-suffix detection: "<number>.<suffix>"
  const byteMatch = str.match(/^(\d+(?:\.\d+)?)\.(\w+)$/);
  if (byteMatch) {
    const suffix = BYTE_SUFFIXES[byteMatch[2]];
    if (suffix) {
      return `"${byteMatch[1]} ${suffix}"`;
    }
  }

  if (colType === 'integer' || colType === 'float') {
    return str;
  }

  return `"${str}"`;
};

export const normalizeOperator = (op) => {
  if (!op) {
    return '';
  }
  const u = String(op).toUpperCase();
  if (u === 'EQUAL') {
    return '=';
  }
  if (u === '!') {
    return 'NOT';
  }
  if (u === 'EXIST') {
    return 'CONTAINS';
  }
  return u;
};

const FIELD_PREFIXES = ['__tag__:', '__count__:', '__find__:'];

export const labelFor = (name, labelMap) => {
  if (!name) {
    return '';
  }
  if (!labelMap) {
    return name;
  }

  // 1. Exact match (key is already fully qualified, e.g. "__tag__:managed/loc")
  if (labelMap.has(name)) {
    return labelMap.get(name);
  }

  // 2. Try adding each prefix (caller passed the bare path)
  const withPrefixMatch = FIELD_PREFIXES.reduce((found, prefix) => {
    if (found !== null) {
      return found;
    }
    const withPrefix = `${prefix}${name}`;
    return labelMap.has(withPrefix) ? labelMap.get(withPrefix) : null;
  }, null);
  if (withPrefixMatch !== null) {
    return withPrefixMatch;
  }

  // 3. Try stripping a prefix the caller may have already added
  const strippedPrefix = FIELD_PREFIXES.find((prefix) => name.startsWith(prefix));
  if (strippedPrefix) {
    const stripped = name.slice(strippedPrefix.length);
    if (labelMap.has(stripped)) {
      return labelMap.get(stripped);
    }
    return stripped;
  }

  return name;
};

const atomToHuman = (miqAtom, labelMap, tagValuesCache) => {
  const keys = Object.keys(miqAtom).filter((k) => k !== '_token' && k !== '_parentIsNot');
  if (keys.length === 0) {
    return '';
  }

  const rawOp = keys[0];
  const body = miqAtom[rawOp] || {};
  const op = normalizeOperator(rawOp);

  // FIND
  if (op === 'FIND') {
    const search = body.search || {};
    const searchOp = Object.keys(search)[0] || '=';
    const searchBody = search[searchOp] || {};
    const searchField = labelFor(searchBody.field, labelMap);
    const searchAlias = searchBody.alias;
    const searchLabel = searchAlias || searchField;
    const searchValue = quoteHuman(searchBody.value ?? null, null);

    const checkKey = ['checkall', 'checkany', 'checkcount'].find((k) => body[k]);
    const checkBody = checkKey ? body[checkKey] : {};
    const checkOp = checkBody ? Object.keys(checkBody)[0] : null;
    const checkOpBody = (checkOp && checkBody[checkOp]) ? checkBody[checkOp] : {};
    const checkField = labelFor(checkOpBody.field, labelMap);
    const checkValue = quoteHuman(checkOpBody.value ?? null, null);

    const searchPart = `${searchLabel} ${normalizeOperator(searchOp)} ${searchValue}`;
    const checkPart = checkOp
      ? `${checkField} ${normalizeOperator(checkOp)} ${checkValue}`
      : '';

    return `FIND ${searchPart} CHECK ${checkPart}`.trim();
  }

  // COUNT OF
  if (body.count !== undefined) {
    const countLabel = labelFor(`__count__:${body.count}`, labelMap);
    const countValue = quoteHuman(body.value ?? null, null);
    return `COUNT OF ${countLabel} ${op} ${countValue}`;
  }

  // CONTAINS (Tag)
  if (body.tag !== undefined) {
    const tagPath = body.tag;
    const rawValue = body.value ?? null;
    const tagLabel = labelFor(`__tag__:${tagPath}`, labelMap);

    // Resolve tag entry label from cache
    let displayValue = rawValue;
    if (tagValuesCache && tagValuesCache.has(tagPath)) {
      const entries = tagValuesCache.get(tagPath);
      const entry = entries.find((e) => String(e.name) === String(rawValue));
      if (entry) {
        displayValue = entry.label;
      }
    }

    return `${tagLabel} contains '${displayValue ?? ''}'`;
  }

  if (body.regkey !== undefined) {
    const regkey = body.regkey || '';
    const regval = body.regval || '';
    const data = body.value ?? null;
    if (op === 'KEY EXISTS') {
      return `KEY EXISTS ${regkey}`;
    }
    if (op === 'VALUE EXISTS') {
      return `VALUE EXISTS ${regkey} : ${regval}`;
    }
    return `${regkey} : ${regval} = '${data ?? ''}'`;
  }

  const fieldName = body.field || '';
  const fieldAlias = body.alias;
  const fieldLabel = fieldAlias || labelFor(fieldName, labelMap);
  const colType = null; // colType not carried in MiqExpression JSON

  // :user_input sentinel
  if (body.value === ':user_input') {
    return `<${fieldLabel}>`;
  }

  const rawValue = body.value ?? null;

  // No-value operators
  const NO_VALUE_OPS = new Set([
    'IS NULL', 'IS NOT NULL', 'IS EMPTY', 'IS NOT EMPTY',
  ]);
  if (NO_VALUE_OPS.has(op)) {
    return `${fieldLabel} ${op}`;
  }

  // IS (exact date)
  if (op === 'IS') {
    return `${fieldLabel} IS ${quoteHuman(rawValue, colType)}`;
  }

  // FROM ... THROUGH ...
  if (op === 'FROM') {
    const [from, through] = Array.isArray(rawValue) ? rawValue : [rawValue, rawValue];
    return `${fieldLabel} FROM ${quoteHuman(from, colType)} THROUGH ${quoteHuman(through, colType)}`;
  }

  // BETWEEN DATES / BETWEEN TIMES
  if (op === 'BETWEEN DATES' || op === 'BETWEEN TIMES') {
    const [from, through] = Array.isArray(rawValue) ? rawValue : [rawValue, rawValue];
    return `${fieldLabel} ${op} ${quoteHuman(from, colType)} AND ${quoteHuman(through, colType)}`;
  }

  // Standard comparison ops: =, !=, <, >, >=, <=, LIKE, STARTS WITH, etc.
  return `${fieldLabel} ${op} ${quoteHuman(rawValue, colType)}`;
};

export const miqExpressionToHuman = (miqExp, labelMap, tagValuesCache) => {
  if (!miqExp || typeof miqExp !== 'object') {
    return '';
  }

  // NOT
  if (miqExp.not !== undefined) {
    const inner = miqExpressionToHuman(miqExp.not, labelMap, tagValuesCache);
    return `NOT (${inner})`;
  }

  // AND
  if (Array.isArray(miqExp.and)) {
    const parts = miqExp.and.map((child) => miqExpressionToHuman(child, labelMap, tagValuesCache));
    return `(${parts.join(' AND ')})`;
  }

  // OR
  if (Array.isArray(miqExp.or)) {
    const parts = miqExp.or.map((child) => miqExpressionToHuman(child, labelMap, tagValuesCache));
    return `(${parts.join(' OR ')})`;
  }

  // Single atom (leaf)
  return atomToHuman(miqExp, labelMap, tagValuesCache);
};

/**
 * Bidirectional conversion between MiqExpression JSON and react-querybuilder (RQB) query JSON.
 *
 * Special RQB field prefixes for non-standard atoms:
 *   __count__:<assoc>      e.g. "__count__:Vm-hardware-disks"
 *   __tag__:<tag_path>     e.g. "__tag__:managed/location"
 *   __find__:<field>       e.g. "__find__:Vm-hardware-disks-filename"
 *   __regkey__             (single registry key entry)
 */

const generateId = () => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

// ── MiqExpression → RQB ───────────────────────────────────────────────────────

const miqAtomToRule = (miqAtom) => {
  const keys = Object.keys(miqAtom).filter((k) => k !== '_token' && k !== '_parentIsNot');
  const op = keys[0];
  const body = miqAtom[op] || {};

  if (op === 'FIND' && body.search) {
    const searchOp = Object.keys(body.search)[0];
    const searchBody = body.search[searchOp] || {};
    const checkKey = ['checkall', 'checkany', 'checkcount'].find((k) => body[k]);
    const checkBody = checkKey ? body[checkKey] : {};
    const checkOp = checkBody ? Object.keys(checkBody)[0] : null;
    const checkOpBody = (checkOp && checkBody[checkOp]) ? checkBody[checkOp] : {};

    return {
      id: generateId(),
      field: `__find__:${searchBody.field || ''}`,
      operator: 'FIND',
      value: {
        skey: searchOp,
        svalue: searchBody.value ?? null,
        alias: searchBody.alias ?? null,
        check: checkKey || 'checkall',
        cfield: checkOpBody.field || null,
        ckey: checkOp || null,
        cvalue: checkOpBody.value ?? null,
      },
    };
  }

  if (body.count !== undefined) {
    return {
      id: generateId(),
      field: `__count__:${body.count}`,
      operator: op,
      value: body.value ?? null,
    };
  }

  if (body.tag !== undefined) {
    return {
      id: generateId(),
      field: `__tag__:${body.tag}`,
      operator: 'CONTAINS',
      value: body.value ?? null,
    };
  }

  if (body.regkey !== undefined) {
    return {
      id: generateId(),
      field: '__regkey__',
      operator: op,
      value: {
        regkey: body.regkey,
        regval: body.regval ?? null,
        data: body.value ?? null,
      },
    };
  }

  // Standard field — decode :user_input sentinel.
  const rawValue = body.value;
  const decodedValue = rawValue === ':user_input' ? '__user_input__' : (rawValue ?? null);

  const rule = {
    id: generateId(),
    field: body.field || '',
    operator: op,
    value: decodedValue,
    ...(body.alias ? { alias: body.alias } : {}),
  };

  // Detect date format ('s' = specific with slashes, 'r' = relative) so
  // DateValueEditor can initialise correctly without re-parsing the string.
  if (Array.isArray(body.value)) {
    const first = body.value[0];
    rule.dateFormat = (typeof first === 'string' && first.includes('/')) ? 's' : 'r';
  } else if (typeof body.value === 'string' && body.value) {
    rule.dateFormat = body.value.includes('/') ? 's' : 'r';
  }

  return rule;
};

export const miqToRqb = (miqExp) => {
  if (!miqExp || typeof miqExp !== 'object') {
    return { id: generateId(), combinator: 'and', rules: [] };
  }

  if (miqExp.not) {
    const inner = miqToRqb(miqExp.not);
    return { ...inner, id: generateId(), not: true };
  }

  if (Array.isArray(miqExp.and)) {
    return {
      id: generateId(),
      combinator: 'and',
      not: false,
      rules: miqExp.and.map((child) => {
        if (child.and || child.or || child.not) {
          return miqToRqb(child);
        }
        return miqAtomToRule(child);
      }),
    };
  }

  if (Array.isArray(miqExp.or)) {
    return {
      id: generateId(),
      combinator: 'or',
      not: false,
      rules: miqExp.or.map((child) => {
        if (child.and || child.or || child.not) {
          return miqToRqb(child);
        }
        return miqAtomToRule(child);
      }),
    };
  }

  // Single leaf atom — wrap in a root AND group.
  if (Object.keys(miqExp).some((k) => k !== '_token' && k !== '_parentIsNot')) {
    return {
      id: generateId(),
      combinator: 'and',
      not: false,
      rules: [miqAtomToRule(miqExp)],
    };
  }

  return { id: generateId(), combinator: 'and', rules: [] };
};

// ── RQB → MiqExpression ───────────────────────────────────────────────────────

const ruleToMiqAtom = (rule) => {
  const { field, operator, value } = rule;

  if (field.startsWith('__find__:')) {
    const searchField = field.slice('__find__:'.length);
    const v = value || {};
    const atom = {
      FIND: {
        search: { [v.skey || '=']: { field: searchField, value: v.svalue ?? null } },
        [v.check || 'checkall']: {
          [v.ckey || '=']: {
            field: v.check === 'checkcount' ? '<count>' : (v.cfield || ''),
            ...(v.cvalue != null ? { value: v.cvalue } : {}),
          },
        },
      },
    };
    if (v.alias) {
      atom.FIND.search[v.skey || '='].alias = v.alias;
    }
    return atom;
  }

  if (field.startsWith('__count__:')) {
    return { [operator]: { count: field.slice('__count__:'.length), value: value ?? null } };
  }

  if (field.startsWith('__tag__:')) {
    return { CONTAINS: { tag: field.slice('__tag__:'.length), value: value ?? null } };
  }

  if (field === '__regkey__') {
    const v = value || {};
    const atom = { [operator]: { regkey: v.regkey || '', regval: v.regval || '' } };
    if (!operator.includes('NULL') && !operator.includes('EMPTY') && !operator.includes('EXISTS')) {
      atom[operator].value = v.data || '';
    }
    if (operator === 'KEY EXISTS') {
      delete atom[operator].regval;
    }
    return atom;
  }

  // Standard field — rule.dateFormat is UI-only, not written to MiqExpression.
  // Encode user-input sentinel back to :user_input.
  const encodedValue = value === '__user_input__' ? ':user_input' : (value ?? null);
  const body = { field, value: encodedValue };
  if (rule.alias) {
    body.alias = rule.alias;
  }
  return { [operator]: body };
};

const rqbGroupToMiq = (rqbGroup, isRoot = false) => {
  const { combinator, not, rules } = rqbGroup;

  const children = (rules || []).map((r) => {
    if (r.rules !== undefined) {
      return rqbGroupToMiq(r, false);
    }
    return ruleToMiqAtom(r);
  });

  // Only flatten a single-child group at the root level; nested groups always
  // emit a full { combinator: [...] } wrapper to survive the round-trip.
  let exp;
  if (children.length === 0) {
    exp = null;
  } else if (children.length === 1 && isRoot) {
    [exp] = children;
  } else {
    exp = { [combinator]: children };
  }

  if (exp === null) {
    return null;
  }
  return not ? { not: exp } : exp;
};

export const rqbToMiq = (rqbGroup) => rqbGroupToMiq(rqbGroup, true);

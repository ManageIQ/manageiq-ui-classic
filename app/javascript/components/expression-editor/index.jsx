import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { QueryBuilder, generateID } from 'react-querybuilder';
import { InlineNotification, Loading } from '@carbon/react';
import { miqToRqb } from './expression-adapter';
import { validateExpression } from './expression-validator';
import { buildFieldConfig } from './field-config';
import TwoStepFieldSelector from './field-selector';
import CarbonValueEditor from './carbon-value-editor';
import {
  ActionButton,
  CombinatorSelector,
  OperatorSelector,
  NotToggle,
} from './carbon-controls';

const CARBON_CONTROLS = {
  fieldSelector: TwoStepFieldSelector,
  operatorSelector: OperatorSelector,
  combinatorSelector: CombinatorSelector,
  valueEditor: CarbonValueEditor,
  notToggle: NotToggle,
  addRuleAction: ActionButton,
  addGroupAction: ActionButton,
  removeRuleAction: ActionButton,
  removeGroupAction: ActionButton,
  cloneRuleAction: ActionButton,
  actionElement: ActionButton,
};

const ExpressionEditor = ({
  model, value, onlyTags, onQueryChange, showAlias, showUserInput, onContextReady, seedEmpty,
}) => {
  const [fields, setFields]   = useState(null);
  const [query, setQuery]     = useState(() => miqToRqb(value || null));
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const tagValuesCache = useRef(new Map());

  // Fetch field metadata once per model.
  useEffect(() => {
    if (!model) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    http.get(`/expression_editor/metadata?model=${encodeURIComponent(model)}`, { skipErrors: true })
      .then((metadata) => {
        const includeRegkey = !onlyTags && model === 'Vm';
        const cfg = buildFieldConfig(metadata, { includeRegkey });

        let grouped = cfg.reduce((acc, f) => {
          const groupLabel = f.group || __('Field');
          let grp = acc.find((g) => g.label === groupLabel);
          if (!grp) {
            grp = { label: groupLabel, options: [] };
            acc.push(grp);
          }
          grp.options.push({ ...f, value: f.name });
          return acc;
        }, []);

        if (onlyTags) {
          grouped = grouped.filter((g) => g.label === __('Tag'));
        }

        setFields(grouped);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, [model, onlyTags]);

  // Build a flat name→label map once when fields are loaded.
  const labelMap = useMemo(() => {
    const all = (fields || []).flatMap((g) => (g.options ? g.options : [g]));
    return new Map(all.map((f) => [f.name, f.label]));
  }, [fields]);

  // Seed one empty rule when there is no existing expression and fields just loaded.
  // Only seeded when the seedEmpty prop is explicitly true (i.e. the main expression
  // editor, not the scope editor).
  useEffect(() => {
    if (!fields || !seedEmpty) {
      return;
    }
    setQuery((q) => {
      if (q.rules.length > 0) {
        return q;
      }
      const emptyRule = {
        id: generateID(), field: '', operator: '=', value: null,
      };
      return { ...q, rules: [emptyRule] };
    });
  }, [fields, seedEmpty]);

  // Notify parent of the label map and tag-values cache as soon as fields load.
  const onContextReadyRef = useRef(onContextReady);
  onContextReadyRef.current = onContextReady;
  useEffect(() => {
    if (fields && onContextReadyRef.current) {
      onContextReadyRef.current(labelMap, tagValuesCache);
    }
  }, [fields, labelMap]);

  // Callback for TagValueSelect to populate the cache after each tag-values fetch.
  const onTagValuesLoaded = useCallback((tagPath, items) => {
    tagValuesCache.current.set(tagPath, items);
  }, []);

  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);

    const errors = validateExpression(newQuery, fields);

    if (onQueryChange) {
      onQueryChange(newQuery, errors);
    }
  }, [fields, onQueryChange]);

  // Update rule.dateFormat without touching its value (used by DateValueEditor's toggle).
  const updateRuleDateFormat = useCallback((ruleId, newDateFormat) => {
    const patchRules = (rules) => rules.map((r) => {
      if (r.rules !== undefined) {
        return { ...r, rules: patchRules(r.rules) };
      }
      if (r.id === ruleId) {
        return { ...r, dateFormat: newDateFormat };
      }
      return r;
    });
    setQuery((q) => {
      const patched = { ...q, rules: patchRules(q.rules) };
      if (onQueryChange) {
        onQueryChange(patched);
      }
      return patched;
    });
  }, [onQueryChange]);

  // Update rule.alias in-place.
  const updateRuleAlias = useCallback((ruleId, alias) => {
    const patchRules = (rules) => rules.map((r) => {
      if (r.rules !== undefined) {
        return { ...r, rules: patchRules(r.rules) };
      }
      if (r.id === ruleId) {
        if (alias !== null) {
          return { ...r, alias };
        }
        const { alias: _a, ...rest } = r;
        return rest;
      }
      return r;
    });
    setQuery((q) => {
      const patched = { ...q, rules: patchRules(q.rules) };
      if (onQueryChange) {
        onQueryChange(patched);
      }
      return patched;
    });
  }, [onQueryChange]);

  // Flip a rule's value to/from the user-input sentinel.
  const updateRuleUserInput = useCallback((ruleId, enabled) => {
    const USER_INPUT = '__user_input__';

    // When unchecking, restore a type-appropriate default so the value editor
    // isn't left blank (which would trigger an immediate validation error).
    const defaultValueForRule = (rule) => {
      if (enabled) {
        return USER_INPUT;
      }
      const allFields = (fields || []).flatMap((g) => (g.options ? g.options : [g]));
      const cfg = allFields.find((f) => f.name === rule.field);
      if (cfg && cfg.valueEditorType === 'select' && Array.isArray(cfg.values) && cfg.values.length) {
        return String(cfg.values[0].name ?? cfg.values[0].value ?? '');
      }
      return null;
    };

    const patchRules = (rules) => rules.map((r) => {
      if (r.rules !== undefined) {
        return { ...r, rules: patchRules(r.rules) };
      }
      if (r.id === ruleId) {
        return { ...r, value: defaultValueForRule(r) };
      }
      return r;
    });
    setQuery((q) => {
      const patched = { ...q, rules: patchRules(q.rules) };
      if (onQueryChange) {
        onQueryChange(patched);
      }
      return patched;
    });
  }, [fields, onQueryChange]);

  if (loading) {
    return <Loading small withOverlay={false} description={__('Loading expression fields…')} />;
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        title={__('Expression Editor')}
        subtitle={error}
        hideCloseButton
      />
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <InlineNotification
        kind="warning"
        title={__('Expression Editor')}
        subtitle={__('No fields available for this model.')}
        hideCloseButton
      />
    );
  }

  return (
    <div className="exp-query-builder-scroll">
      <div className="exp-query-builder">
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={handleQueryChange}
          onAddRule={(rule) => ({
            ...rule, field: '', operator: '=', value: null,
          })}
          enableMountQueryChange={false}
          autoSelectField={false}
          autoSelectValue={false}
          showNotToggle
          showCloneButtons
          addRuleToNewGroups
          controlElements={CARBON_CONTROLS}
          context={{
            updateRuleDateFormat,
            updateRuleAlias,
            updateRuleUserInput,
            model,
            showAlias,
            showUserInput,
            labelMap,
            tagValuesCache,
            onTagValuesLoaded,
          }}
        />
      </div>
    </div>
  );
};

export default ExpressionEditor;

/**
 * ExpressionEditor — react-querybuilder v8 with Carbon Design System controls.
 *
 * Props:
 *   model         {string}    MiqExpression model, e.g. "Vm"
 *   value         {Object}    Initial MiqExpression JSON (null for blank)
 *   onlyTags      {boolean}   Restrict fields to the Tag group only
 *   saveUrl       {string}    POST URL to persist the expression
 *   editKey       {string}    Session edit key
 *   fieldPath     {string[]}  Path into @edit to write
 *   onQueryChange {Function}  Optional callback — receives the RQB query on every change
 *   showAlias     {boolean}   Show inline alias checkbox + label input per rule
 *   showUserInput {boolean}   Show "User will input value" checkbox per rule
 */
import { useState, useEffect, useCallback } from 'react';
import { QueryBuilder } from 'react-querybuilder';
import { InlineNotification, Loading } from '@carbon/react';
import './expression-editor.scss';
import { miqToRqb, rqbToMiq } from './expression-adapter';
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

const SAVE_URL = '/expression_editor/expression_update';

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
  model, value, onlyTags, saveUrl, editKey, fieldPath, onQueryChange,
  showAlias, showUserInput,
}) => {
  const [fields, setFields]   = useState(null);
  const [query, setQuery]     = useState(() => miqToRqb(value || null));
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Fetch field metadata once per model.
  useEffect(() => {
    if (!model) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    http.get(`/expression_editor/metadata?model=${encodeURIComponent(model)}`)
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

  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);

    const errors = validateExpression(newQuery, fields);

    if (onQueryChange) {
      onQueryChange(newQuery, errors);
    }

    if (errors.length > 0 || !editKey || !fieldPath) {
      return;
    }

    http.post(saveUrl || SAVE_URL, { edit_key: editKey, field_path: fieldPath, expression: rqbToMiq(newQuery) });
  }, [saveUrl, editKey, fieldPath, fields, onQueryChange]);

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

  // Update rule.alias in-place and persist.
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
      if (editKey && fieldPath) {
        http.post(saveUrl || SAVE_URL, { edit_key: editKey, field_path: fieldPath, expression: rqbToMiq(patched) });
      }
      return patched;
    });
  }, [onQueryChange, saveUrl, editKey, fieldPath]);

  // Flip a rule's value to/from the user-input sentinel and persist.
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
      if (editKey && fieldPath) {
        http.post(saveUrl || SAVE_URL, { edit_key: editKey, field_path: fieldPath, expression: rqbToMiq(patched) });
      }
      return patched;
    });
  }, [fields, onQueryChange, saveUrl, editKey, fieldPath]);

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
          enableMountQueryChange={false}
          showNotToggle
          showCloneButtons
          controlElements={CARBON_CONTROLS}
          context={{
            updateRuleDateFormat,
            updateRuleAlias,
            updateRuleUserInput,
            model,
            showAlias,
            showUserInput,
          }}
        />
      </div>
    </div>
  );
};

export default ExpressionEditor;

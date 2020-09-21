import { ActionForm } from './action.form.jsx';
import { AlertForm } from './alert.form.jsx';
import { AlertProfileForm } from './alert-profile.form.jsx';
import { ConditionForm } from './condition.form.jsx';
import { EventForm } from './event.form.jsx';
import { PolicyForm } from './policy.form.jsx';
import { PolicyProfileForm } from './policy-profile.form.jsx';

export function register(add) {
  add('ActionForm', ActionForm);
  add('AlertForm', AlertForm);
  add('AlertProfileForm', AlertProfileForm);
  add('ConditionForm', ConditionForm);
  add('EventForm', EventForm);
  add('PolicyForm', PolicyForm);
  add('PolicyProfileForm', PolicyProfileForm);
}

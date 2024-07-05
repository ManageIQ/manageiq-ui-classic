import React, { useState, useEffect } from 'react';
import {
  Folder20, Search20, RuleFilled20, Edit20
} from '@carbon/icons-react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import PropTypes from 'prop-types';
import { Loading, Button } from 'carbon-components-react';
import createSchema from './rbac-role-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

let idCounter = 0;

let modified = false;

const RbacRoleForm = (props) => {
  const {
    selectOptions, url, getURL, customProps, role,
  } = props;

  const generateId = () => idCounter++;
  const transformTree = (node) => {
    const currentId = generateId();

    const nodeObject = {
      value: `${node.key}#${currentId}`,
      label: node.text,
    };

    let icon;
    switch (node.icon) {
      case 'fa fa-search':
        icon = <Search20 color="black" />;
        break;

      case 'fa fa-shield':
        icon = <RuleFilled20 color="black" />;
        break;

      case 'pficon pficon-edit':
        icon = <Edit20 color="black" />;
        break;

      case 'pficon pficon-folder-close':
        if (node.nodes === undefined) {
          icon = <Folder20 color="black" />;
        }
        break;
      default:
        break;
    }
    if (icon) {
      nodeObject.icon = <span>{ icon }</span>;
    }

    if (node.nodes) {
      nodeObject.children = node.nodes.map(transformTree);
    }
    return nodeObject;
  };

  const [formData, setFormData] = useState({
    isLoading: false,
    params: {},
    initialValues: {},
    nodes: [],
    checked: [],
  });

  const customValidation = (values) => {
    const errors = {};
    if (values.tree_dropdown === undefined) {
      values.tree_dropdown = formData.initialValues.featuresWithId || [];
    }
    if (values) {
      if (values.name === formData.initialValues.name
        && values.vm_restriction === formData.initialValues.vm_restriction
        && values.service_template_restriction === formData.initialValues.service_template_restriction
        && JSON.stringify(values.tree_dropdown) === JSON.stringify(formData.initialValues.featuresWithId)) {
        modified = false;
      } else {
        modified = true;
      }

      if (values.name === '' || (values && values.tree_dropdown && values.tree_dropdown.length === 0)) {
        errors.valid = 'not_valid';
      }
    }
    return errors;
  };

  const isEdit = !!(role && role.id);

  useEffect(() => {
    if (formData.isLoading) {
      http.post(url, formData.params)
        .then(() => {
          const confirmation = isEdit ? __('Role Edited') : __('Role Created');
          miqRedirectBack(sprintf(confirmation), 'success', '/ops/explorer');
        })
        .catch((error) => console.log('error: ', error));
    } else if (isEdit) {
      http.get(`${getURL}/${role.id}`).then((roleValues) => {
        if (roleValues) {
          const bsTree = JSON.parse(customProps.bs_tree);
          const nodes = bsTree.map(transformTree);
          let uniqueBoxes = [];
          if (roleValues.featuresWithId) {
            uniqueBoxes = roleValues.featuresWithId.map((str) => {
              const parts = str.split('__');
              parts[0] = role.id;
              return parts.join('__');
            });
          }
          setFormData({
            ...formData, isLoading: false, initialValues: roleValues, nodes, checked: uniqueBoxes,
          });
        }
      });
    } else {
      let uniqueBoxes = [];
      if (role.features_with_id) {
        uniqueBoxes = role.features_with_id.map((str) => {
          const parts = str.split('__');
          parts[0] = 'new';
          return parts.join('__');
        });
      }
      const initialValues = {
        name: role.name !== null ? `Copy of ${role.name}` : '',
        vm_restriction: role && role.settings && role.settings.restrictions && role.settings.restrictions.vms,
        service_template_restriction: role && role.settings && role.settings.restrictions && role.settings.restrictions.service_templates,
        tree_dropdown: role.name !== null ? role && role.features_with_id : [],
      };
      const bsTree = JSON.parse(customProps.bs_tree);
      const nodes = bsTree.map(transformTree);
      if (initialValues) {
        setFormData({
          ...formData, isLoading: false, initialValues, nodes, checked: uniqueBoxes,
        });
      }
    }
  }, [formData.isLoading, role]);

  const onSubmit = (values) => {
    miqSparkleOn();
    if (!values.tree_dropdown) {
      values.tree_dropdown = formData.checked;
    }

    const treeDropdown = values.tree_dropdown;
    const treeValues = treeDropdown.map((string) => string.split('#')[0]);
    const splitValues = treeValues.map((string) => string.split('__')[1]);
    values.tree_dropdown = splitValues;

    if (values.vm_restriction === '-1') {
      values.vm_restriction = '';
    }

    if (values.service_template_restriction === '-1') {
      values.service_template_restriction = '';
    }

    // do split to get rid of id on submit
    const params = {
      name: values.name,
      vm_restriction: values.vm_restriction,
      service_template_restriction: values.service_template_restriction,
      features: values.tree_dropdown,
      featuresWithId: treeDropdown,
    };

    setFormData({
      ...formData,
      isLoading: true,
      params,
    });
  };

  const onCancel = () => {
    const confirmation = role.id ? __(`Edit of Role was cancelled by the user`)
      : __(`Add of new Role was cancelled by the user`);
    const message = sprintf(
      confirmation
    );
    miqRedirectBack(message, 'warning', '/ops/explorer');
  };

  const onReset = () => {
    http.get(`${getURL}/${role.id}`).then((roleValues) => {
      if (roleValues) {
        let uniqueBoxes = [];
        if (roleValues.featuresWithId) {
          uniqueBoxes = roleValues.featuresWithId.map((str) => {
            const parts = str.split('__');
            parts[0] = role.id;
            return parts.join('__');
          });
        }
        setFormData({
          ...formData, isLoading: false, initialValues: roleValues, checked: uniqueBoxes,
        });
      }
    });
  };

  return (
    <div>
      {formData.isLoading ? (
        <div className="summary-spinner">
          <Loading active small withOverlay={false} className="loading" />
        </div>
      ) : (
        <div className="rbac-role-form">
          <MiqFormRenderer
            schema={createSchema(selectOptions, customProps, formData)}
            initialValues={formData.initialValues}
            onSubmit={onSubmit}
            onCancel={onCancel}
            onReset={onReset}
            validate={(values) => customValidation(values)}
            FormTemplate={(props) => <FormTemplate {...props} roleId={role.id} />}
          />
        </div>
      )}
    </div>
  );
};

const FormTemplate = ({
  formFields, roleId,
}) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { valid } = getState();
  const submitLabel = !!roleId ? __('Save') : __('Add');
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            { !roleId
              ? (
                <Button
                  disabled={!valid}
                  kind="primary"
                  className="btnRight"
                  type="submit"
                  variant="contained"
                >
                  {submitLabel}
                </Button>
              ) : (
                <Button
                  disabled={!valid || !modified}
                  kind="primary"
                  className="btnRight"
                  type="submit"
                  variant="contained"
                >
                  {submitLabel}
                </Button>
              )}
            {!!roleId
              ? (
                <Button
                  disabled={!modified}
                  kind="secondary"
                  className="btnRight"
                  variant="contained"
                  onClick={onReset}
                  type="button"
                >
                  { __('Reset')}
                </Button>
              ) : null}

            <Button variant="contained" type="button" onClick={onCancel} kind="secondary">
              { __('Cancel')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

RbacRoleForm.propTypes = {
  selectOptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string.isRequired)).isRequired,
  url: PropTypes.string,
  getURL: PropTypes.string,
  customProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  role: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    settings: PropTypes.shape({
      restrictions: PropTypes.shape({
        service_templates: PropTypes.string.isRequired,
        vms: PropTypes.string.isRequired,
      }),
    }),
    features_with_id: PropTypes.arrayOf(PropTypes.string),
  }),
};

RbacRoleForm.defaultProps = {
  url: '',
  getURL: '',
  role: undefined,
};

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(
    PropTypes.shape({ selectOptions: PropTypes.arrayOf(PropTypes.string) }),
    PropTypes.shape({ url: PropTypes.string }),
    PropTypes.shape({ getURL: PropTypes.string }),
    PropTypes.shape({ customProps: PropTypes.object }),
    PropTypes.shape({ role: PropTypes.object }),
  ),
  roleId: PropTypes.number,
};

FormTemplate.defaultProps = {
  formFields: undefined,
  roleId: undefined,
};

export default RbacRoleForm;

import React, { useState, useMemo, useEffect } from "react";
import MiqFormRenderer from "@@ddf";
import createSchema from "./vm-common-rename-form.schema";
import { API } from "../../http_api";
import PropTypes from "prop-types";
import miqRedirectBack from "../../helpers/miq-redirect-back";

const VmCommonRenameForm = ({ vmId }) => {
  const [{ isLoading, initialValues, fields }, setState] = useState({
    isLoading: !!vmId,
    fields: [],
  });

  useEffect(() => {
    if (vmId) {
      API.get(`/api/vms/${vmId}`).then((initialValues) => {
        setState((state) => ({ ...state, initialValues, isLoading: false }));
      });
    }
  }, [vmId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    let data = {
      action: "rename",
      new_name: values.name,
    };
    const request = API.post(`/api/vms/${vmId}`, data);

    request
      .then(() => {
        const message = sprintf(
          'Renaming of VM to "%s" has been successfully queued',
          values.name
        );
        miqRedirectBack(message, "success", "/vm_or_template");
      })
      .catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      'Edit of VM "%s" was canceled by the user.',
      initialValues.name
    );
    miqRedirectBack(message, "warning", "/vm_or_template");
  };

  return (
    <MiqFormRenderer
      schema={createSchema(fields)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

VmCommonRenameForm.propTypes = {
  vmId: PropTypes.string,
};

VmCommonRenameForm.defaultProps = {
  vmId: undefined,
};

export default VmCommonRenameForm;

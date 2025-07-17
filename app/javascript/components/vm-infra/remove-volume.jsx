import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Grid } from "carbon-components-react";
import MiqFormRenderer from "../../forms/data-driven-form";
import { API } from "../../http_api";
import miqRedirectBack from "../../helpers/miq-redirect-back";
import createDetachSchema from "./remove-volume.schema";

const DetachVolumeForm = ({ recordId, redirect }) => {
  const [state, setState] = useState({
    isLoading: true,
    volumes: [],
  });

  const [isSubmitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`/vm_infra/${recordId}/attached_volumes`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error((data.error && data.error.message) || 'Failed to fetch attached volumes');
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          volumes: data.resources || [],
        }));
      } catch (error) {
        console.error('Error fetching volumes:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
          volumes: []
        }));
      }
    };

    fetchVolumes();
  }, [recordId]);

  const schema = useMemo(() => createDetachSchema(state.volumes), [state.volumes]);

  const onFormChange = (values) => {
    setSubmitDisabled(!values.volumeName);
  };

  const onSubmit = (values) => {
    miqSparkleOn();

    let payload = {
      action: "detach",
      resource: {
        volume_name: values.volumeName.trim(),
        vm_id: recordId
      },
    };

    const request = API.post(`/api/container_volumes/${recordId}`, payload)
    request.then(() => {
      const message = sprintf(
        __('Detachment of Container Volume has been successfully queued.')
      );
      miqRedirectBack(message, 'success', redirect);
    }).catch((error) => {
      miqRedirectBack(error.message || __("Failed to detach volume"), "error", redirect);
    }).finally(miqSparkleOff);
    
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = sprintf(__('Detach Volume was cancelled by the user.'));
    miqRedirectBack(message, 'warning', redirect);
  };

  return state.isLoading ? null : (
    <Grid>
      <MiqFormRenderer
        schema={schema}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canSubmit={!isSubmitDisabled}
        onStateUpdate={onFormChange}
        buttonsLabels={{ submitLabel: __("Detach") }}
      />
    </Grid>
  );
};

DetachVolumeForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  redirect: PropTypes.string.isRequired,
};

export default DetachVolumeForm;

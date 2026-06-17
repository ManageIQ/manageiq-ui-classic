import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Grid } from "carbon-components-react";
import MiqFormRenderer from "../../forms/data-driven-form";
import { API } from "../../http_api";
import createSchema from "./add-volume.schema";
import miqRedirectBack from "../../helpers/miq-redirect-back";

const AddVolumeForm = ({ recordId, redirect }) => {
  const [state, setState] = useState({
    isLoading: true,
    volumes: [],
    storageClasses: [],
  });

  const [isSubmitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    const fetchPersistentVolumeClaims = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch PVCs
        const pvcResponse = await fetch(`/vm_infra/persistentvolumeclaims/${recordId}`);
        const pvcData = await pvcResponse.json();
        if (!pvcResponse.ok) throw new Error((pvcData.error && pvcData.error.message) || "Failed to fetch PVCs");

        // Fetch Storage Classes
        const scResponse = await fetch(`/vm_infra/storage_class_list/${recordId}`);
        const scData = await scResponse.json();
        if (!scResponse.ok) throw new Error((scData.error && scData.error.message) || "Failed to fetch Storage Classes");

        setState(prev => ({
          ...prev,
          isLoading: false,
          volumes: pvcData.resources || [],
          storageClasses: scData.resources || [],
          vmInfo: {
            name: pvcData.vm_name,
            namespace: pvcData.vm_namespace
          }
        }));
      } catch (error) {
        console.error('Error fetching PVCs:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
          volumes: [],
          storageClasses: [],
        }));
      }
    };

  fetchPersistentVolumeClaims();
}, [recordId]);

  const schema = useMemo(() => createSchema(state.volumes, state.storageClasses), [state.volumes, state.storageClasses]);

  const onFormChange = (values) => {
    if (values.volumeSourceType === "existing") {
      setSubmitDisabled(!values.pvcName);
    } else if (values.volumeSourceType === "new") {
      setSubmitDisabled(!values.newVolumeName || !values.newVolumeSize);
    } else {
      setSubmitDisabled(true);
    }
  };

  const onSubmit = (values) => {
    const { volumeSourceType } = values;

    let payload;

    if (volumeSourceType === "existing") {
      const volumeNameFinal =
        values.volumeName && values.volumeName.trim()
          ? values.volumeName.trim()
          : values.pvcName;

      payload = {
        action: "attach",
        resource: {
          pvc_name: values.pvcName,
          volume_name: volumeNameFinal,
          vm_id: recordId
        }
      };
    } else {
      payload = {
        action: "create_and_attach_volume",
        resource: {
          volume_name: values.newVolumeName.trim(),
          volume_size: values.newVolumeSize.trim(),
          storage_class: values.storage_class,
          access_mode: values.access_mode,
          vm_id: recordId,
          device: values.device_mountpoint ? values.device_mountpoint : ''
        },
      };
    }

    const request = API.post(`/api/container_volumes/${recordId}`, payload);

    request.then(() => {
      const message = sprintf(
        __('Attechment of Volume has been successfully queued.')
      );
      miqRedirectBack(message, 'success', redirect);
    }).catch((error) => {
      miqRedirectBack(error.message || __("Failed to attach volume"), "error", redirect);
    }).finally(miqSparkleOff);

  };

  const onCancel = () =>
    miqRedirectBack(__("Add Volume was cancelled by the user"), "warning", redirect);

  return state.isLoading ? null : (
    <Grid>
      <MiqFormRenderer
        schema={schema}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canSubmit={!isSubmitDisabled}
        onStateUpdate={onFormChange}
      />
    </Grid>
  );
};

AddVolumeForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  redirect: PropTypes.string.isRequired,
};

export default AddVolumeForm;
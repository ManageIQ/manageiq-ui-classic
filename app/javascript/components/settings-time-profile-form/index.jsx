import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import createSchema from './settings-time-profile-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { dataHelper } from './helper';

const SettingsTimeProfileForm = ({
  timeProfileId, timezones, action, userid,
}) => {
  const [{
    isLoading, initialValues, fields, tz,
  }, setState] = useState({
    isLoading: !!timeProfileId,
    fields: [],
  });

  // Used to determine if the error needs to be displayed if the user does not select any hours
  const [showHoursError, setShowHoursError] = useState(false);

  const onCancel = () => {
    let message = '';
    if (timeProfileId !== '') {
      message = __(`Editing of time profile ${initialValues.description} was cancelled by the user.`);
    } else {
      message = __(`Adding new time profile was cancelled by the user.`);
    }
    miqRedirectBack(message, 'warning', '/configuration/change_tab/4?uib-tab=4');
  };

  const onSubmit = (values) => {
    if (values.profile.tz === 'null') {
      values.profile.tz = null;
    }

    if (values.profile.hoursAM === undefined) {
      values.profile.hoursAM = [];
    }
    if (values.profile.hoursPM === undefined) {
      values.profile.hoursPM = [];
    }

    if (values.profile.hoursAM.length === 0 && values.profile.hoursPM.length === 0 && values.HoursSelectAll === false) {
      setShowHoursError(true);
    } else {
      miqSparkleOn();

      const data = dataHelper(values, timeProfileId, action, userid);

      if (timeProfileId !== '' && action !== 'timeprofile_copy') {
        const request = API.post(`/api/time_profiles/${timeProfileId}`, data);
        request
          .then(() => {
            const message = __(`Editing of time profile ${values.description} has been successfully queued`);
            miqRedirectBack(message, 'success', '/configuration/change_tab/4?uib-tab=4');
          })
          .catch(miqSparkleOff);
      } else {
        const request = API.post(`/api/time_profiles`, data);
        request
          .then(() => {
            const message = __(`Creating time profile ${values.description} has been successfully queued`);
            miqRedirectBack(message, 'success', '/configuration/change_tab/4?uib-tab=4');
          })
          .catch(miqSparkleOff);
      }
    }
  };

  useEffect(() => {
    if (timeProfileId !== '') {
      API.get(`/api/time_profiles/${timeProfileId}`).then((initialValues) => {
        initialValues.profile.hoursAM = [];
        initialValues.profile.hoursPM = [];
        initialValues.profile.hours.forEach((hour) => {
          if (hour < 12) {
            initialValues.profile.hoursAM.push(hour);
          } else {
            initialValues.profile.hoursPM.push(hour);
          }
        });
        setState((state) => ({
          ...state,
          initialValues,
          isLoading: false,
          tz: initialValues.profile.tz,
        }));
      });
    } else {
      setState((state) => ({
        ...state,
        initialValues,
        isLoading: false,
      }));
    }
  }, [timeProfileId]);

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <div>
      <MiqFormRenderer
        schema={createSchema(fields, tz, timeProfileId, timezones, showHoursError, setShowHoursError)}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

SettingsTimeProfileForm.propTypes = {
  timeProfileId: PropTypes.string,
  timezones: PropTypes.arrayOf(PropTypes.any).isRequired,
  action: PropTypes.string.isRequired,
  userid: PropTypes.string,
};

SettingsTimeProfileForm.defaultProps = {
  timeProfileId: '',
  userid: '',
};

export default SettingsTimeProfileForm;

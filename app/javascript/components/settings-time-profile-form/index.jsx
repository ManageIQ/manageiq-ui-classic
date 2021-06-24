import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import createSchema from './settings-time-profile-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const SettingsTimeProfileForm = ({
  timeProfileId, timezones, action, userid,
}) => {
  const [{
    isLoading, initialValues, fields, tz,
  }, setState] = useState({
    isLoading: !!timeProfileId,
    fields: [],
  });

  const [show, setShow] = useState(false);

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
      setShow(true);
    } else {
      miqSparkleOn();

      let data = {};
      let APIaction = 'edit';
      let metrics = values.rollup_daily_metrics;
      let profileType = values.profile_type;
      let profile = {};
      let { days } = values.profile;
      const { tz } = values.profile;

      if (timeProfileId === '' || action === 'timeprofile_copy') {
        APIaction = 'create';
      }

      if (values.rollup_daily_metrics === undefined) {
        metrics = false;
      }

      if (values.profile_type === undefined) {
        profileType = 'user';
      }

      let hours = [];
      if (values.profile.hoursAM !== undefined) {
        for (let i = 0; i < values.profile.hoursAM.length; i += 1) {
          hours.push(values.profile.hoursAM[i]);
        }
      }

      if (values.profile.hoursPM !== undefined) {
        for (let i = 0; i < values.profile.hoursPM.length; i += 1) {
          hours.push(values.profile.hoursPM[i]);
        }
      }

      if (values.DaysSelectAll) {
        days = [0, 1, 2, 3, 4, 5, 6];
      }

      if (values.HoursSelectAll) {
        hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      }
      days.sort();
      hours.sort((int1, int2) => int1 - int2);

      profile = {
        days,
        hours,
        tz,
      };

      if (timeProfileId !== '' && action !== 'timeprofile_copy') {
        data = {
          action: APIaction,
          description: values.description,
          profile_type: profileType,
          profile_key: userid,
          profile,
          rollup_daily_metrics: metrics,
        };
        const request = API.post(`/api/time_profiles/${timeProfileId}`, data);
        request
          .then(() => {
            const message = __(`Editing of time profile ${values.description} has been successfully queued`);
            miqRedirectBack(message, 'success', '/configuration/change_tab/4?uib-tab=4');
          })
          .catch(miqSparkleOff);
      } else {
        data = {
          action: APIaction,
          description: values.description,
          profile_type: profileType,
          profile_key: userid,
          profile,
          rollup_daily_metrics: metrics,
        };
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
        for (let i = 0; i < initialValues.profile.hours.length; i += 1) {
          const hourID = initialValues.profile.hours[i];
          if (hourID < 12) {
            initialValues.profile.hoursAM.push(initialValues.profile.hours[i]);
          } else {
            initialValues.profile.hoursPM.push(initialValues.profile.hours[i]);
          }
        }
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
        schema={createSchema(fields, tz, timeProfileId, timezones, show, setShow)}
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

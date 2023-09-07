import React, { useState } from 'react';
import { Button } from 'carbon-components-react';

/** button component used as a mapper to change the password */
export const ChangePasswordButton = (props) => {
  const { newRecord, enableConfirmPassword, isConfirmPasswordEnabled } = props;
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleClick = () => {
    /**Enable change password button if its not a new record */
    if (!newRecord) {
      enableConfirmPassword(!isConfirmPasswordEnabled);
      setIsChangingPassword(!isChangingPassword);
    }
  };

  return !newRecord ? (
    <div className="change-button-container">
      <Button kind="secondary" onClick={handleClick} className="change-button">
      {isChangingPassword ? "Cancel" : "Change"}
      </Button>
    </div>
  ) : null;
};

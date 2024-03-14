import React, { useContext } from 'react';
import { Button, Accordion, AccordionItem } from 'carbon-components-react';
import {
  InputParameterButtonActions, InputParameterRecordActions, headers, reformatList,
} from './helper';
import MiqDataTable from '../../miq-data-table';
import NotificationMessage from '../../notification-message';
import AutomateMethodContext from '../automate-method-context';

const AutomateMethodInputParameter = () => {
  /** Context to access data from parent component */
  const { formData, updateInputParameter } = useContext(AutomateMethodContext);

  /** Input parameter selection handler */
  const onSelect = (item) => {
    if (item && item.callbackAction) {
      switch (item.callbackAction) {
        case InputParameterButtonActions.EDIT:
          return updateInputParameter(InputParameterRecordActions.OPEN, { selectedId: item.id });
        case InputParameterButtonActions.DELETE:
          return updateInputParameter(InputParameterRecordActions.DELETE, { selectedId: item.id });
        default:
          return undefined;
      }
    }
    return undefined;
  };

  const renderAddButton = () => (
    <div className="custom-form-buttons">
      <Button onClick={() => updateInputParameter('openModal', undefined)} kind="primary" size="sm">
        {__('Add Input Parameters')}
      </Button>
    </div>

  );

  return (
    <div className="automate-custom-form custom-form-wrapper">
      <Accordion align="start" className="miq-custom-form-accordion">
        <AccordionItem title={__('Input Parameters')} open>
          {renderAddButton()}
          {
            formData.inputParameter.items.length > 0
              ? (
                <MiqDataTable
                  headers={headers}
                  rows={reformatList(formData.inputParameter.items)}
                  onCellClick={(selectedRow) => onSelect(selectedRow)}
                  mode="button-group-list"
                />
              )
              : (
                <>
                  <br />
                  <NotificationMessage type="info" message={__('Input parameters are not available.')} />
                </>
              )
          }
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AutomateMethodInputParameter;

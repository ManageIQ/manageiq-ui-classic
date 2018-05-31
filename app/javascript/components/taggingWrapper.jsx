import React from 'react';
import { TaggingWithButtonsConnected, taggingApp } from '@manageiq/react-ui-components/dist/tagging';
import '@manageiq/react-ui-components/dist/tagging.css';

export default class TaggingWrapper extends React.Component{

  componentWillMount()  {
    ManageIQ.redux.addReducer(taggingApp);
    ManageIQ.redux.store.dispatch({type: ''});
    ManageIQ.redux.store.dispatch({ initialState: this.props.tags, type: "UI-COMPONENTS_TAGGING_LOAD_STATE" });
  }

  render() {
    const { urls } = this.props;
    return (<TaggingWithButtonsConnected
          saveButton={
            {
              onClick: (assignedTags) => {
                console.log(assignedTags);
                $.post(urls.save_url, { data: JSON.stringify(assignedTags)});
              },
              href: '',
              type: 'button',
              disabled: false,
              description: 'Save'
            }
          }
          cancelButton={{ onClick: () => { $.post(urls.cancel_url);  },
            href: '', type: 'button', disabled: false, description: 'Cancel'}}
          resetButton={{ onClick: () => { ManageIQ.redux.store.dispatch({ type: "UI-COMPONENTS_TAGGING_RESET_STATE" });  },
            href: '', type: 'button', disabled: false, description: 'Reset'}}
        />
      )
    }
}

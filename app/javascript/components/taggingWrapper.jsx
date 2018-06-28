import React from 'react';
import { connect } from 'react-redux';
import { TaggingWithButtonsConnected, taggingApp } from '@manageiq/react-ui-components/dist/tagging';
import '@manageiq/react-ui-components/dist/tagging.css';

class TaggingWrapper extends React.Component{
  componentDidMount()  {
    this.loadState(this.props.tags);
  }

  constructor(props) {
    super(props);
    ManageIQ.redux.addReducer(taggingApp);
  }

  loadState = (state) => this.props.loadState(state);
  reset = () =>  this.props.reset();
  isLoaded = () => this.props.isLoaded();

  render() {
    if (!this.props.isLoaded) return <div>bkjfbkjnkjfdkjfkj</div>
    const { urls } = this.props;
    return (<TaggingWithButtonsConnected
          saveButton={
            {
              onClick: (assignedTags) => {
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
          resetButton={{ onClick: () => this.reset({ type: "UI-COMPONENTS_TAGGING_RESET_STATE" }),
            href: '', type: 'button', disabled: false, description: 'Reset'}}
        />
      )
    }
}

const mapDispatchToProps = dispatch => ({
  loadState: state => dispatch({ initialState: state, type: "UI-COMPONENTS_TAGGING_LOAD_STATE" }),
  reset: () => dispatch({ type: "UI-COMPONENTS_TAGGING_RESET_STATE" })
})

const mapStateToProps = ({ tagging }) => {
  console.log(tagging);
  return {
  isLoaded: !!tagging,
}}

const TaggingWrapperConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaggingWrapper);

export default TaggingWrapperConnected;

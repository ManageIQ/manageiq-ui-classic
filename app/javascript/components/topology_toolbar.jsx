import React from 'react';
import { FormControl } from 'patternfly-react';

const searchClick = (e) => {
  console.log('searchClick');
  e.preventDefault();
  sendDataWithRx({ service: 'topologyService', name: 'searchNode' });
};

const refreshClick = () => {
  sendDataWithRx({ name: 'refreshTopology' });
};

const resetSearchClick = () => {
  console.log('resetSearchClick');
  sendDataWithRx({ service: 'topologyService', name: 'resetSearch' });
};
// # this hidden button is a workaround
// # pressing enter in ^input triggers a *click* event on the next button
// # without this, that button is resetSearch, which ..is undesirable :)

// app/views/shared/_topology_header_toolbar.html.haml
const TopologyToolbar = () => (
  <div className="toolbar-pf-actions miq-toolbar-actions">
    <div className="miq-toolbar-group form-group">
      <div className="form-group text">
        <label className="topology-checkbox checkbox-inline">
          <input id="box_display_names" type="checkbox" />
          {__('Display Names')}
        </label>
      </div>
      <div className="form-group">
        <button type="button" className="btn btn-default" title={__('Refresh this page')} onClick={refreshClick} >
          <i className="fa fa-refresh fa-lg" />
          {__('Refresh')}
        </button>
      </div>
      <form
        style={{ display: 'inline' }}
        className="topology-tb topology-search"
        onSubmit={e => searchClick(e)}
      >
        <div className="form-group has-clear">
          <div className="search-pf-input-group" style={{ position: 'relative' }}>
            <label className="sr-only" htmlFor="search">
              {__('Search')}
            </label>
            <input id="search_topology" className="form-control" type="search" placeholder={__('Search')} />
            <button type="button" className="hidden" onClick={searchClick} />
            <button type="button" className="clear" aria-hidden="true" onClick={resetSearchClick}>
              <span className="pficon pficon-close" />
            </button>
          </div>
        </div>
        <div className="form-group search-button">
          <button type="button" className="btn btn-default search-topology-button" onClick={searchClick}>
            <span className="fa fa-search" />
           </button>
        </div>
      </form>
    </div>
  </div>
);

TopologyToolbar.propTypes = {
};

export default TopologyToolbar;

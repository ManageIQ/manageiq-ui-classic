import React from 'react';

const searchClick = (e) => {
  e.preventDefault();
  sendDataWithRx({ service: 'topologyService', name: 'searchNode' });
};

const refreshClick = () => {
  sendDataWithRx({ name: 'refreshTopology' });
};

const resetSearchClick = () => {
  sendDataWithRx({ service: 'topologyService', name: 'resetSearch' });
};

const TopologyToolbar = () => (
  <div className="toolbar-pf-actions miq-toolbar-actions">
    <div className="miq-toolbar-group form-group">
      <div className="form-group text">
        <label htmlFor="box_display_names" className="topology-checkbox checkbox-inline">
          <input id="box_display_names" type="checkbox" />
          {__('Display Names')}
        </label>
      </div>
      <div className="form-group">
        <button type="button" className="btn btn-default" title={__('Refresh this page')} onClick={refreshClick}>
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
            <label className="sr-only" htmlFor="search_topology">
              {__('Search')}
            </label>
            <input id="search_topology" className="form-control" type="search" placeholder={__('Search')} />
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

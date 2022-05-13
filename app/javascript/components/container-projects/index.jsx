import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import debouncePromise from '../../helpers/promise-debounce';
import {
  getCPUChart, getStatusCards, getMemoryChart, getNetworkChart, getPodsTrendChart, getPodsTable, getQuotasChart,
} from './helper';

const ContainerProjects = ({ url }) => {
  const [{ dashboardData, isLoading }, setState] = useState({ isLoading: true });

  const getDashboardData = (newUrl) => {
    http.get(newUrl)
      .then((response) => {
        setState({
          dashboardData: response,
          isLoading: false,
        });
      });
  };

  useEffect(() => {
    const scope = {};
    const pathname = window.location.pathname.replace(/\/$/, '');
    if (pathname.match(/show$/)) {
      scope.id = '';
    } else if (pathname.match(/^\/[^/]+\/show\/(\d+)/)) {
      // search for pattern ^/<controler>/show/<id>$ in the pathname
      scope.id = `/${/^\/[^/]+\/show\/(\d+)/.exec(pathname)[1]}`;
    } else {
      // search for pattern ^/<controler>/<id>$ in the pathname
      scope.id = `/${/^\/[^/]+\/(\d+)$/.exec(pathname)[1]}`;
    }
    const newUrl = `${url}${scope.id}`;

    if (isLoading) {
      const asyncValidatorDebounced = debouncePromise(getDashboardData(newUrl));
      asyncValidatorDebounced()
        .catch(() => {
          setState({
            isLoading: false,
            error: true,
          });
        });
    }
  });

  const getColumn1 = () => (
    <div id="column-1">
      {getStatusCards(isLoading, dashboardData)}
      {getCPUChart(isLoading, dashboardData)}
      {getMemoryChart(isLoading, dashboardData)}
      {getNetworkChart(isLoading, dashboardData)}
      {getPodsTrendChart(isLoading, dashboardData)}
    </div>
  );

  const getColumn2 = () => (
    <div id="column-2">
      {getQuotasChart(isLoading, dashboardData)}
      {getPodsTable(isLoading, dashboardData)}
    </div>
  );

  return (
    <div>
      {getColumn1()}
      {getColumn2()}
    </div>
  );
};

ContainerProjects.propTypes = {
  url: PropTypes.string.isRequired,
};

ContainerProjects.defaultProps = {
};

export default ContainerProjects;

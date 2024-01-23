/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Loading } from 'carbon-components-react';
import MiqStructuredList from '../miq-structured-list';

const CatalogItemRequestInfo = ({ recordId, tabLabels, tabConditions }) => {
  console.log('tabLabels=', tabLabels);
  console.log('tabConditions=', tabConditions);

  const [data, setData] = useState({
    isLoading: true,
    tabContents: undefined,
    currentTab: tabLabels ? tabLabels[0].name : undefined,
  });

  useEffect(() => {
    if (recordId) {
      API.get(`/api/service_templates/${recordId}?expand=resources`).then(({ config_info }) => {
        tabConditions.forEach((tabKey) => {
          Object.values(tabKey).forEach((items) => {
            items.forEach((item) => {
              item.rows.forEach((row) => {
                console.log(row.key);
                row.value = row.input ? row.input : config_info[row.key];
              });
            });
          });
        });
        setData({
          ...data,
          isLoading: false,
          tabContents: tabConditions,
        });
      });
    }
  }, [recordId]);

  const checkType = (data) => {
    if (Array.isArray(data)) {
      return data[1];
    } if (typeof data === 'object' && data !== null) {
      return data;
    } if (typeof data === 'string') {
      return data;
    } if (typeof data === 'number') {
      return data.toString();
    }
    return data;
  };

  const rowData = (rows) => rows.map((row) => ({ label: row.label, value: checkType(row.value) }));

  /** Function to render the tab contents */
  const renderTabContent = (name) => {
    if (data.isLoading) {
      return (
        <div className="loadingSpinner center">
          <Loading active small withOverlay={false} className="loading" />
        </div>
      );
    }
    const tabContent = tabConditions.find((item) => name in item);
    if (!tabContent) {
      return undefined;
    }
    const content = Object.values(tabContent);
    return (
      <div className="request-info-tab-contents" id={`request-info-tab-${name}`}>
        {
          content.map((items, index) => (
            <div key={`content-${index.toString()}`}>
              {
                items.map((item, index) => (
                  <div key={index.toString()}>
                    <br />
                    <MiqStructuredList
                      rows={rowData(item.rows)}
                      title={item.title}
                      mode={`request-info-tab-summary-${name}`}
                    />
                  </div>

                ))
              }
            </div>
          ))
        }
      </div>
    );
  };

  return (
    <div className="catalog-item-request-info-wrapper">
      {
        tabLabels.length > 0 && (
          <Tabs id="catalog-item-request-info-tabs">
            {
              tabLabels.map(({ name, text }) => (
                <Tab key={`tab${name}`} label={`${text}`}>
                  {
                    tabConditions && renderTabContent(name)
                  }
                </Tab>
              ))
            }
          </Tabs>
        )
      }
    </div>
  );
};

CatalogItemRequestInfo.propTypes = {
  recordId: PropTypes.number.isRequired,
  tabLabels: PropTypes.arrayOf(PropTypes.any).isRequired,
  tabConditions: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default CatalogItemRequestInfo;

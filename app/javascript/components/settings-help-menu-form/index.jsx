import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './help-menu-form.schema';

const HelpMenuTab = ({ initialValues, initialDropdownValues }) => {
  const [dropdownValue, setDropdownValue] = useState(initialDropdownValues || []);
  const [data, setData] = useState({
    params: [],
    isLoading: false,
  });

  const options = [
    { label: 'Current Window', value: 'default' },
    { label: 'New Window', value: 'new_window' },
    { label: 'About Modal', value: 'modal' },
  ];

  useEffect(() => {
    if (data.isLoading) {
      http.post('/ops/settings_update_help_menu/', data.params).then(() => {
        setData({
          ...data,
          isLoading: false,
        });
        add_flash(__('Help menu customization changes successfully stored.'), 'success');
        window.location.reload();
      }).catch(() => {
        setData({
          ...data,
          isLoading: false,
        });
        add_flash(__('Storing the custom help menu configuration was not successful.'), 'error');
        window.location.reload();
      });
      setData({ ...data, isLoading: false });
    }
  }, [data.isLoading]);

  const onSubmit = (values) => {
    const submitValues = {};
    submitValues.documentation_title = values.item_label_1 || '';
    submitValues.product_title = values.item_label_2 || '';
    submitValues.about_title = values.item_label_3 || '';

    submitValues.documentation_href = values.url_1 || '';
    submitValues.product_href = values.url_2 || '';
    submitValues.about_href = values.url_3 || '';

    submitValues.documentation_type = values.select_dropdown_1;
    submitValues.product_type = values.select_dropdown_2;
    submitValues.about_type = values.select_dropdown_3;

    setData({ params: submitValues, isLoading: true });
  };

  return ((
    <div className="main-div">
      <div className="title">{`${__('Customize Help Menu')}`}</div>
      <div className="info-box">
        <span className="info-icon">i</span>
        {`${__('Any change to the help menu will take effect upon a full page reload.')}`}
      </div>
      <hr className="divider" />
      <div className="settings-help-menu-tab">
        <MiqFormRenderer
          schema={createSchema(options, dropdownValue, setDropdownValue, initialValues)}
          onSubmit={onSubmit}
          validate={() => {}}
        />
      </div>
    </div>
  ));
};

HelpMenuTab.propTypes = {
  initialValues: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  initialDropdownValues: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

HelpMenuTab.defaultProps = {
  initialValues: undefined,
  initialDropdownValues: undefined,
};

export default HelpMenuTab;

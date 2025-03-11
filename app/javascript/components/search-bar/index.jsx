/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button, TextInput, Form,
} from 'carbon-components-react';
import {
  ChevronDown32, Search32, ProgressBarRound32, Close32,
} from '@carbon/icons-react';

const SearchBar = ({ searchText, advancedSearch, action }) => {
  const [data, setData] = useState({
    formText: searchText || '',
    loading: false,
  });

  useEffect(() => {
    if (data.loading) {
      const form = document.getElementById('search-bar-form');
      if (form) {
        form.submit();
      }
    }
  }, [data.loading]);

  /** Function to filter the results through form submit. */
  const onSearch = () => {
    http.post(action, null, { headers: {}, skipJsonParsing: true });
  };

  /** Function to clear the search input and submit the form from useEffect. */
  const onClear = () => {
    setData({
      formText: '',
      loading: true,
    });
  };

  /** Function to submit the form using the lens button. */
  const formSubmit = () => {
    setData({
      ...data,
      loading: true,
    });
  };

  /** Function to render the Clear button. */
  const renderClear = () => (
    <Button
      kind="secondary"
      disabled={data.loading}
      renderIcon={Close32}
      iconDescription={__('Clear')}
      hasIconOnly
      tooltipPosition="bottom"
      type="reset"
      onClick={() => onClear()}
    />
  );

  /** Function to render the Lens button. */
  const renderLens = () => (
    <Button
      renderIcon={data.loading ? ProgressBarRound32 : Search32}
      disabled={data.loading}
      iconDescription={__('Search')}
      hasIconOnly
      tooltipPosition="bottom"
      className="search_button"
      onClick={formSubmit}
    />
  );

  /** Function to render the Settings button. */
  const renderSettings = () => (
    <Button
      renderIcon={ChevronDown32}
      iconDescription={__('Advanced Search')}
      hasIconOnly
      data-toggle="modal"
      data-target="#advsearchModal"
      disabled={data.loading}
      title={_('Advanced Search')}
      id="adv_search"
      tooltipPosition="bottom"
      tooltipAlignment="end"
      type="button"
      onClick={() => miqJqueryRequest('adv_search_toggle', { beforeSend: true })}
    />
  );

  return (
    <div className="search_bar">
      <Form onSubmit={onSearch} method="post" id="search-bar-form">
        <input type="hidden" name="authenticity_token" />
        <TextInput
          id="search_text"
          labelText={__('Search')}
          hideLabel
          placeholder={__('Search')}
          name="search[text]"
          value={data.formText}
          title={__('Search by Name within results')}
          onChange={(event) => setData({
            ...data,
            formText: event.target.value,
          })}
        />
        { data.formText && renderClear() }
        { renderLens() }
      </Form>
      { advancedSearch && renderSettings() }
    </div>
  );
};

export default SearchBar;

SearchBar.propTypes = {
  searchText: PropTypes.string,
  advancedSearch: PropTypes.bool,
  action: PropTypes.string,
};

SearchBar.defaultProps = {
  searchText: '',
  advancedSearch: true,
  action: '',
};

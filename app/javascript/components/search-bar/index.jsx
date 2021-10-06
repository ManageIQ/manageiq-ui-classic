/* eslint-disable no-undef */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, TextInput, Form,
} from 'carbon-components-react';
import { ChevronDown32, Search32, Close32 } from '@carbon/icons-react';

const SearchBar = ({ searchText, advancedSearch, action }) => {
  const formToken = () => {
    const csrfToken = document.querySelector('meta[name=csrf-token]');
    return csrfToken ? csrfToken.getAttribute('content') : '';
  };
  const [data, setData] = useState(searchText || '');

  /** Function to submit the form after clearing the search text. */
  const formSubmit = () => {
    const form = document.getElementById('search-bar-form');
    if (form) {
      form.submit();
    }
  };

  /** Function to filter the results through form submit. */
  const onSearch = () => {
    http.post({ url: action });
  };

  /** Function to clear the search input and submit the form. */
  const onClear = () => {
    setData('');
    setTimeout(() => formSubmit(), 100);
  };

  const renderClear = () => (
    <Button
      kind="secondary"
      renderIcon={Close32}
      iconDescription={__('Clear')}
      hasIconOnly
      tooltipPosition="bottom"
      type="reset"
      onClick={() => onClear()}
    />
  );

  const renderLens = () => (
    <Button
      renderIcon={Search32}
      iconDescription={__('Search')}
      hasIconOnly
      tooltipPosition="bottom"
      className="search_button"
      type="submit"
    />
  );

  const renderSettings = () => (
    <Button
      renderIcon={ChevronDown32}
      iconDescription={__('Advanced Search')}
      hasIconOnly
      data-toggle="modal"
      data-target="#advsearchModal"
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
        <input type="hidden" name="authenticity_token" value={formToken()} />
        <TextInput
          id="search_text"
          labelText={_('Search')}
          hideLabel
          placeholder="Search"
          name="search[text]"
          value={data}
          title={_('Search by Name within results')}
          onChange={(event) => setData(event.target.value)}
        />
        { data && renderClear() }
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

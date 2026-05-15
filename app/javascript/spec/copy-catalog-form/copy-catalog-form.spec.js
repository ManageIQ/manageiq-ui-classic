import React from 'react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import CopyCatalogForm from '../../components/copy-catalog-form/copy-catalog-form';
import '../helpers/miqAjaxButton';

describe('Copy catalog form', () => {
  let initialProps;
  let cancelUrl;
  let copySavedUrl;
  let spyMiqAjaxButton;

  beforeEach(() => {
    initialProps = {
      catalogId: '10000000000000',
      originName: 'Template1',
    };

    cancelUrl = `/catalog/servicetemplate_copy_cancel/${initialProps.catalogId}`;
    copySavedUrl = '/catalog/servicetemplate_copy_saved';
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');

    fetchMock.getOnce('/catalog/servicetemplates_names', {
      names: ['Template1', 'Template2'],
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('should handle cancel', async() => {
    const user = userEvent.setup();
    const { container } = renderWithRedux(
      <CopyCatalogForm {...initialProps} />
    );

    await waitFor(() => {
      expect(
        container.querySelector('button.cds--btn--secondary')
      ).toBeInTheDocument();
    });

    const cancelButton = container.querySelector('button.cds--btn--secondary');
    await user.click(cancelButton);

    expect(spyMiqAjaxButton).toHaveBeenCalledWith(cancelUrl);
  });

  it('should handle submit', async() => {
    const user = userEvent.setup();
    const postData = '{"id":"10000000000000","name":"Copy of Template1","copy_tags":false}';
    fetchMock.postOnce('/catalog/save_copy_catalog', {});

    const { container } = renderWithRedux(
      <CopyCatalogForm {...initialProps} />
    );
    let submitButton;
    await waitFor(() => {
      submitButton = container.querySelector('button.cds--btn--primary');
      expect(submitButton).not.toBeDisabled();
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called('/catalog/save_copy_catalog')).toBe(true);
    });
    await waitFor(() => {
      expect(spyMiqAjaxButton).toHaveBeenCalledWith(copySavedUrl);
    });
    expect(fetchMock.lastOptions().body).toEqual(postData);
  });
});

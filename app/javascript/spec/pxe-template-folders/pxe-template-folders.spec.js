import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PxeTemplateFolders from '../../components/pxe-template-folders/index';

describe('PxeTemplateFolders Component', () => {
  const mockMiqTreeActivateNode = jest.fn();

  beforeEach(() => {
    window.miqTreeActivateNode = mockMiqTreeActivateNode;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with empty folders array', () => {
    const { container } = render(<PxeTemplateFolders folders={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('should render only system folder when no user folders', () => {
    render(<PxeTemplateFolders folders={[]} />);
    const rows = screen.getAllByRole('row');
    // Should have header row + 1 system folder row = 2 total
    expect(rows).toHaveLength(2);
    expect(screen.getByText('Examples (read only)')).toBeInTheDocument();
  });

  it('should render with folders data', () => {
    const folders = [
      { id: 1, name: 'Folder 1' },
      { id: 2, name: 'Folder 2' },
    ];
    const { container } = render(<PxeTemplateFolders folders={folders} />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText('Examples (read only)')).toBeInTheDocument();
    expect(screen.getByText('Folder 1')).toBeInTheDocument();
    expect(screen.getByText('Folder 2')).toBeInTheDocument();
  });

  it('should render correct number of rows (system + user folders)', () => {
    const folders = [
      { id: 1, name: 'Folder 1' },
      { id: 2, name: 'Folder 2' },
      { id: 3, name: 'Folder 3' },
    ];
    render(<PxeTemplateFolders folders={folders} />);
    const rows = screen.getAllByRole('row');

    // Should have header row + 1 system folder + 3 user folders = 5 total
    expect(rows).toHaveLength(5);
  });

  it('should call miqTreeActivateNode when handleCellClick is triggered with system folder', async() => {
    const user = userEvent.setup();
    const folders = [{ id: 1, name: 'Test Folder' }];

    render(<PxeTemplateFolders folders={folders} />);
    // Click on system folder row
    const systemCell = screen.getByText('Examples (read only)');
    await user.click(systemCell);

    expect(mockMiqTreeActivateNode).toHaveBeenCalledWith(
      'customization_templates_tree',
      'xx-xx-system'
    );
  });

  it('should call miqTreeActivateNode when handleCellClick is triggered with user folder', async() => {
    const user = userEvent.setup();
    const folders = [{ id: 1, name: 'Test Folder' }];
    render(<PxeTemplateFolders folders={folders} />);

    // Click on user folder cell
    const userFolderCell = screen.getByText('Test Folder');
    await user.click(userFolderCell);

    expect(mockMiqTreeActivateNode).toHaveBeenCalledWith(
      'customization_templates_tree',
      'pit-1'
    );
  });

  it('should not call miqTreeActivateNode when row has no id', () => {
    const user = userEvent.setup();
    const folders = [{ id: 1, name: 'Test Folder' }];
    const { container } = render(<PxeTemplateFolders folders={folders} />);
    const dataTableDiv = container.querySelector(
      '#template_folders_div .miq-data-table'
    );
    expect(dataTableDiv).toBeInTheDocument();
    user.click(dataTableDiv);

    expect(mockMiqTreeActivateNode).not.toHaveBeenCalled();
  });

  it('should mark all rows as clickable', () => {
    const folders = [
      { id: 1, name: 'Folder 1' },
      { id: 2, name: 'Folder 2' },
    ];
    const { container } = render(<PxeTemplateFolders folders={folders} />);
    // Check that all rows have the clickable-row class
    const clickableRows = container.querySelectorAll('tr.clickable-row');
    // Should have 3 clickable rows: 1 system folder + 2 user folders
    expect(clickableRows).toHaveLength(3);
  });
});

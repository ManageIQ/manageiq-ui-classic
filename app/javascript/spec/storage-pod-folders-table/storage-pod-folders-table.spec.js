import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoragePodFoldersTable from '../../components/storage-pod-folders-table/index';

describe('StoragePodFoldersTable Component', () => {
  const mockMiqTreeActivateNode = jest.fn();

  beforeEach(() => {
    window.miqTreeActivateNode = mockMiqTreeActivateNode;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with empty folders array', () => {
    const { container } = render(<StoragePodFoldersTable folders={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('should render with folders data', () => {
    const folders = [
      { id: 1, name: 'DSC-Production' },
      { id: 2, name: 'DSC-Development' },
    ];
    const { container } = render(<StoragePodFoldersTable folders={folders} />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText('DSC-Production')).toBeInTheDocument();
    expect(screen.getByText('DSC-Development')).toBeInTheDocument();
  });

  it('should render the correct number of rows', () => {
    const folders = [
      { id: 1, name: 'DSC-Production' },
      { id: 2, name: 'DSC-Development' },
      { id: 3, name: 'DSC-Staging' },
    ];
    render(<StoragePodFoldersTable folders={folders} />);
    const rows = screen.getAllByRole('row');
    // 3 data rows (no header row rendered when header is empty string)
    expect(rows).toHaveLength(3);
  });

  it('should call miqTreeActivateNode with the correct node id when a row is clicked', async() => {
    const user = userEvent.setup();
    const folders = [{ id: 42, name: 'DSC-Production' }];
    render(<StoragePodFoldersTable folders={folders} />);

    const cell = screen.getByText('DSC-Production');
    await user.click(cell);

    expect(mockMiqTreeActivateNode).toHaveBeenCalledWith('storage_pod_tree', 'f-42');
  });

  it('should mark all rows as clickable', () => {
    const folders = [
      { id: 1, name: 'DSC-Production' },
      { id: 2, name: 'DSC-Development' },
    ];
    const { container } = render(<StoragePodFoldersTable folders={folders} />);
    const clickableRows = container.querySelectorAll('tr.clickable-row');
    expect(clickableRows).toHaveLength(2);
  });
});

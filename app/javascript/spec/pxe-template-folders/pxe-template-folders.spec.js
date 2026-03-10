import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PxeTemplateFolders from '../../components/pxe-template-folders/index';

describe('PxeTemplateFolders Component', () => {
  let mockMiqTreeActivateNode;

  beforeEach(() => {
    mockMiqTreeActivateNode = jest.fn();
    window.miqTreeActivateNode = mockMiqTreeActivateNode;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with empty folders array', () => {
    const wrapper = shallow(<PxeTemplateFolders folders={[]} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render only system folder when no user folders', () => {
    const wrapper = shallow(<PxeTemplateFolders folders={[]} />);
    const dataTable = wrapper.find('MiqDataTable');
    const rows = dataTable.prop('rows');

    // Should have only the system folder
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('xx-xx-system');
  });

  it('should render with folders data', () => {
    const folders = [
      { id: 1, name: 'Folder 1' },
      { id: 2, name: 'Folder 2' },
    ];
    const wrapper = shallow(<PxeTemplateFolders folders={folders} />);
    const dataTable = wrapper.find('MiqDataTable');

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(dataTable).toHaveLength(1);
    expect(dataTable.prop('mode')).toBe('template-folders');
    expect(dataTable.prop('headers')).toBeDefined();
    expect(dataTable.prop('rows')).toBeDefined();
    expect(dataTable.prop('onCellClick')).toBeDefined();
  });

  it('should render correct number of rows (system + user folders)', () => {
    const folders = [
      { id: 1, name: 'Folder 1' },
      { id: 2, name: 'Folder 2' },
      { id: 3, name: 'Folder 3' },
    ];
    const wrapper = shallow(<PxeTemplateFolders folders={folders} />);
    const dataTable = wrapper.find('MiqDataTable');
    const rows = dataTable.prop('rows');

    // Should have 1 system folder + 3 user folders = 4 total
    expect(rows).toHaveLength(4);
  });

  it('should call miqTreeActivateNode when handleCellClick is triggered with system folder', () => {
    const folders = [{ id: 1, name: 'Test Folder' }];
    const wrapper = shallow(<PxeTemplateFolders folders={folders} />);
    const dataTable = wrapper.find('MiqDataTable');
    const onCellClick = dataTable.prop('onCellClick');

    // Simulate clicking on system folder
    onCellClick({ id: 'xx-xx-system' });

    expect(mockMiqTreeActivateNode).toHaveBeenCalledWith(
      'customization_templates_tree',
      'xx-xx-system'
    );
  });

  it('should call miqTreeActivateNode when handleCellClick is triggered with user folder', () => {
    const folders = [{ id: 1, name: 'Test Folder' }];
    const wrapper = shallow(<PxeTemplateFolders folders={folders} />);
    const dataTable = wrapper.find('MiqDataTable');
    const onCellClick = dataTable.prop('onCellClick');

    // Simulate clicking on user folder
    onCellClick({ id: 'pit-1' });

    expect(mockMiqTreeActivateNode).toHaveBeenCalledWith(
      'customization_templates_tree',
      'pit-1'
    );
  });

  it('should not call miqTreeActivateNode when row has no id', () => {
    const folders = [{ id: 1, name: 'Test Folder' }];
    const wrapper = shallow(<PxeTemplateFolders folders={folders} />);
    const dataTable = wrapper.find('MiqDataTable');
    const onCellClick = dataTable.prop('onCellClick');

    // Simulate clicking on row without id
    onCellClick({});
    expect(mockMiqTreeActivateNode).not.toHaveBeenCalled();

    // Simulate clicking with null row
    onCellClick(null);
    expect(mockMiqTreeActivateNode).not.toHaveBeenCalled();
  });

  it('should mark all rows as clickable', () => {
    const folders = [
      { id: 1, name: 'Folder 1' },
      { id: 2, name: 'Folder 2' },
    ];
    const wrapper = shallow(<PxeTemplateFolders folders={folders} />);
    const dataTable = wrapper.find('MiqDataTable');
    const rows = dataTable.prop('rows');

    // Check that all rows are clickable
    rows.forEach((row) => {
      expect(row.clickable).toBe(true);
    });
  });
});

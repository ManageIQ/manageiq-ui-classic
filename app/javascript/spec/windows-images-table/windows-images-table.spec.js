import React from 'react';
import { render, screen } from '@testing-library/react';
import WindowsImagesTable from '../../components/data-tables/windows-images-table';
import { tableData } from '../../components/data-tables/windows-images-table/helper';

describe('WindowsImagesTable component', () => {
  const mockData = [
    {
      id: 1,
      name: 'Windows Image 1',
      description: 'Test Description 1',
      path: '/path/to/image1',
      index: 1,
    },
    {
      id: 2,
      name: 'Windows Image 2',
      description: 'Test Description 2',
      path: '/path/to/image2',
      index: 2,
    },
  ];

  it('should render the table with data', () => {
    const { container } = render(<WindowsImagesTable initialData={mockData} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Windows Image 1')).toBeInTheDocument();
    expect(screen.getByText('Windows Image 2')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should not render table when initialData is empty', () => {
    const { container } = render(<WindowsImagesTable initialData={[]} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});

describe('WindowsImagesTable helper functions', () => {
  describe('tableData', () => {
    const mockData = [
      {
        id: 1,
        name: 'Windows Image',
        description: 'Test Description',
        path: '/path/to/image',
        index: 1,
      },
    ];

    it('should generate correct table structure', () => {
      const { headers, rows } = tableData(mockData);

      expect(headers).toHaveLength(4);
      expect(headers[0]).toEqual({ key: 'name', header: 'Name' });
      expect(headers[1]).toEqual({ key: 'description', header: 'Description' });
      expect(headers[2]).toEqual({ key: 'path', header: 'Path' });
      expect(headers[3]).toEqual({ key: 'index', header: 'Index' });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual({
        id: '1',
        name: 'Windows Image',
        description: 'Test Description',
        path: '/path/to/image',
        index: 1,
        clickable: true,
      });
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import PxeImagesTable from '../../components/data-tables/pxe-images-table';
import { tableData } from '../../components/data-tables/pxe-images-table/helper';

describe('PxeImagesTable component', () => {
  const mockData = [
    {
      id: 1,
      name: 'Test Image 1',
      description: 'Test Description 1',
      kernel: 'vmlinuz',
      default_for_windows: true,
    },
    {
      id: 2,
      name: 'Test Image 2',
      description: 'Test Description 2',
      kernel: 'bzImage',
      default_for_windows: false,
    },
  ];

  it('should render the table with data', () => {
    const { container } = render(<PxeImagesTable initialData={mockData} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Test Image 1')).toBeInTheDocument();
    expect(screen.getByText('Test Image 2')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should not render table when initialData is empty', () => {
    const { container } = render(<PxeImagesTable initialData={[]} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});

describe('PxeImagesTable helper functions', () => {
  describe('tableData', () => {
    const mockData = [
      {
        id: 1,
        name: 'Test Image',
        description: 'Test Description',
        kernel: 'vmlinuz',
        default_for_windows: true,
      },
    ];

    it('should generate correct table structure', () => {
      const { headers, rows } = tableData(mockData);

      expect(headers).toHaveLength(4);
      expect(headers[0]).toEqual({ key: 'name', header: 'Name' });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual({
        id: '1',
        name: 'Test Image',
        description: 'Test Description',
        kernel: 'vmlinuz',
        default_for_windows: 'Yes',
        clickable: true,
      });
    });

    it('should handle default_for_windows boolean values', () => {
      const dataWithTrue = [{ ...mockData[0], default_for_windows: true }];
      const dataWithFalse = [{ ...mockData[0], default_for_windows: false }];

      expect(tableData(dataWithTrue).rows[0].default_for_windows).toBe('Yes');
      expect(tableData(dataWithFalse).rows[0].default_for_windows).toBe('');
    });
  });
});

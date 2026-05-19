import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProvGrid from '../../components/prov-grid';
import { provGridData } from './prov-vm-grid-data';
import { ProvGridTypes } from '../../components/prov-grid/helper';

describe('ProvGrid component', () => {
  const mode = (type) => `.prov-${type}-grid-data-table`;

  it('should render prov_vm_grid table', async() => {
    const type = ProvGridTypes.vm;
    const initialData = provGridData({ type, fieldId: 'service__src_vm_id' });
    const { container } = render(<ProvGrid initialData={initialData} />);

    expect(container.querySelectorAll(mode(type))).toHaveLength(1);
    expect(container.querySelectorAll('tr.clickable-row')).toHaveLength(
      initialData.rows.length
    );

    const user = userEvent.setup();
    const rows = container.querySelectorAll('tr.clickable-row');
    await user.click(rows[rows.length - 1]);

    expect(container).toMatchSnapshot();
  });

  it('should render prov_host_grid table', async() => {
    const type = ProvGridTypes.host;
    const initialData = provGridData({
      type,
      fieldId: 'environment__placement_host_name',
    });
    const { container } = render(<ProvGrid initialData={initialData} />);

    expect(container.querySelectorAll(mode(type))).toHaveLength(1);
    expect(container.querySelectorAll('tr.clickable-row')).toHaveLength(
      initialData.rows.length
    );

    const user = userEvent.setup();
    const rows = container.querySelectorAll('tr.clickable-row');
    await user.click(rows[rows.length - 1]);

    expect(container).toMatchSnapshot();
  });

  it('should render prov_ds_grid table', async() => {
    const type = ProvGridTypes.ds;
    const initialData = provGridData({
      type,
      fieldId: 'environment__placement_ds_name',
    });
    const { container } = render(<ProvGrid initialData={initialData} />);

    expect(container.querySelectorAll(mode(type))).toHaveLength(1);
    expect(container.querySelectorAll('tr.clickable-row')).toHaveLength(
      initialData.rows.length
    );

    const user = userEvent.setup();
    const rows = container.querySelectorAll('tr.clickable-row');
    await user.click(rows[rows.length - 1]);

    expect(container).toMatchSnapshot();
  });

  it('should render prov_iso_img_grid table', async() => {
    const type = ProvGridTypes.isoImg;
    const initialData = provGridData({
      type,
      fieldId: 'service__iso_image_id',
    });
    const { container } = render(<ProvGrid initialData={initialData} />);

    expect(container.querySelectorAll(mode(type))).toHaveLength(1);
    expect(container.querySelectorAll('tr.clickable-row')).toHaveLength(
      initialData.rows.length
    );

    const user = userEvent.setup();
    const rows = container.querySelectorAll('tr.clickable-row');
    await user.click(rows[rows.length - 1]);

    expect(container).toMatchSnapshot();
  });

  it('should render prov_pxe_img_grid table', async() => {
    const type = ProvGridTypes.pxeImg;
    const initialData = provGridData({
      type,
      fieldId: 'service__pxe_image_id',
    });
    const { container } = render(<ProvGrid initialData={initialData} />);

    expect(container.querySelectorAll(mode(type))).toHaveLength(1);
    expect(container.querySelectorAll('tr.clickable-row')).toHaveLength(
      initialData.rows.length
    );

    const user = userEvent.setup();
    const rows = container.querySelectorAll('tr.clickable-row');
    await user.click(rows[rows.length - 1]);

    expect(container).toMatchSnapshot();
  });

  it('should render prov_template_grid table', async() => {
    const type = ProvGridTypes.template;
    const initialData = provGridData({
      type,
      fieldId: 'customize__customization_template_id',
    });
    const { container } = render(<ProvGrid initialData={initialData} />);

    expect(container.querySelectorAll(mode(type))).toHaveLength(1);
    expect(container.querySelectorAll('tr.clickable-row')).toHaveLength(
      initialData.rows.length
    );

    const user = userEvent.setup();
    const rows = container.querySelectorAll('tr.clickable-row');
    await user.click(rows[rows.length - 1]);

    expect(container).toMatchSnapshot();
  });
});

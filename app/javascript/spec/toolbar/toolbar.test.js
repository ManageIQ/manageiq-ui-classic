import React from 'react';
import { render, screen } from '@testing-library/react';

import { Toolbar } from '../../components/toolbar';

import toolbarData from './data/toolbar-big.json';
import viewData from './data/toolbar-view.json';

describe('Toolbar', () => {
  it('Well it works ;-)', () => {
    const { container } = render(
      <Toolbar
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the ToolbarView component', () => {
    const { container } = render(
      <Toolbar
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    expect(
      container.querySelector('.toolbar-pf-view-selector')
    ).toBeInTheDocument();
  });

  it('renders view buttons', () => {
    const { container } = render(
      <Toolbar
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    const viewButtons = container.querySelectorAll('button.btn.btn-link');
    expect(viewButtons).toHaveLength(3);
  });

  it('renders groups', () => {
    const { container } = render(
      <Toolbar
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    const groups = container.querySelectorAll('.miq-toolbar-group');
    expect(groups).toHaveLength(4);
  });

  it('renders simple buttons', () => {
    const { container } = render(
      <Toolbar
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    const simpleButtons = container.querySelectorAll('.toolbar-button');
    expect(simpleButtons).toHaveLength(2);
    expect(container.querySelector('.fa-refresh')).toBeInTheDocument();
  });

  it('renders drop-down buttons', () => {
    const { container } = render(
      <Toolbar
        kebabLimit={0}
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    const dropdowns = container.querySelectorAll('.toolbar-overflow');
    expect(dropdowns).toHaveLength(7);
    const configurationElements = screen.getAllByText('Configuration');
    expect(configurationElements.length).toBeGreaterThan(0);
    expect(container.querySelector('.fa-cog')).toBeInTheDocument();
  });

  it('renders applies kebabLimit properly', () => {
    const { container } = render(
      <Toolbar
        kebabLimit={3}
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    const dropdowns = container.querySelectorAll('.toolbar-overflow');
    expect(dropdowns).toHaveLength(10);
  });

  it('renders kebab buttons', () => {
    const { container } = render(
      <Toolbar
        onClick={() => {}}
        onViewClick={() => {}}
        groups={toolbarData}
        views={viewData}
        count={0}
      />
    );
    expect(container.querySelector('.kebab')).toBeInTheDocument();
  });
});

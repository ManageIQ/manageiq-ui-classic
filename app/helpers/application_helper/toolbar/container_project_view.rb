class ApplicationHelper::Toolbar::ContainerProjectView < ApplicationHelper::Toolbar::Basic
  button_group('container_project', [
    twostate(
      :view_summary,
      'fa fa-th-list',
      N_('Summary View'),
      nil,
      :url       => "/show",
      :url_parms => ""
    ),
    twostate(
      :view_topology,
      'fa pficon-topology',
      N_('Topology View'),
      nil,
      :url       => "/show",
      :url_parms => "?display=topology",
      :klass     => ApplicationHelper::Button::TopologyFeatureButton
    )
  ])
end

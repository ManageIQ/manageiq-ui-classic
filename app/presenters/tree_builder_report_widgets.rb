class TreeBuilderReportWidgets < TreeBuilder
  # Need this for display purpose to map with id
  WIDGET_TYPES = {
    "r"  => N_('Reports'),
    "c"  => N_('Charts'),
    "m"  => N_('Menus')
  }.freeze

  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Widgets"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    objects = WIDGET_TYPES.collect { |k, v| {:id => k, :text => _(v), :icon => 'pficon pficon-folder-close', :tip => _(v)} }
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    widgets = MiqWidget.where(:content_type => ReportController::Widgets::WIDGET_CONTENT_TYPE[object[:id].split('-').last])
    count_only_or_objects(count_only, widgets, 'title')
  end
end

class TreeBuilderReportWidgets < TreeBuilder
  # Need this for display purpose to map with id
  WIDGET_TYPES = {
    "r"  => N_('Reports'),
    "c"  => N_('Charts'),
    "rf" => N_('RSS Feeds'),
    "m"  => N_('Menus')
  }.freeze

  def self.widget_tree_id(widget)
    widget_type = ReportController::Widgets::WIDGET_CONTENT_TYPE.invert[widget.content_type]
    "xx-#{widget_type}_-#{widget.id}"
  end

  private

  def tree_init_options(_tree_name)
    {:leaf => 'Widgets', :full_ids => true}
  end

  def set_locals_for_render
    super.merge!(:autoload => true)
  end

  def root_options
    {
      :text    => t = _("All Widgets"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    objects = WIDGET_TYPES.collect { |k, v| {:id => k, :text => _(v), :icon => 'pficon pficon-folder-close', :tip => _(v)} }
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    widgets = MiqWidget.where(:content_type => ReportController::Widgets::WIDGET_CONTENT_TYPE[object[:id].split('-').last])
    count_only_or_objects(count_only, widgets, 'title')
  end
end

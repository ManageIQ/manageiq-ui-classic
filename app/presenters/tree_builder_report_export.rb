class TreeBuilderReportExport < TreeBuilder
  private

  def tree_init_options(tree_name)
    {
      :leaf     => 'Export',
      :full_ids => true,
      :open_all => true
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true)
  end

  def root_options
    {
      :title   => t = _("Import / Export"),
      :tooltip => t,
      :icon    => 'product product-report'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    export_children = [
      {:id    => 'exportcustomreports',
       :text  => _('Custom Reports'),
       :icon  => 'product product-report'},
      {:id    => 'exportwidgets',
       :text  => _('Widgets'),
       :icon  => 'product product-report'}
    ]
    count_only_or_objects(count_only, export_children)
  end
end

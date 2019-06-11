class TreeBuilderReportExport < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true, :open_all => true}
  end

  def root_options
    {
      :text    => t = _("Import / Export"),
      :tooltip => t,
      :icon    => 'fa fa-file-text-o'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    nodes = [
      {:id   => 'exportcustomreports',
       :text => _('Custom Reports'),
       :icon => 'fa fa-file-text-o'},
      {:id   => 'exportwidgets',
       :text => _('Widgets'),
       :icon => 'fa fa-file-text-o'}
    ]
    count_only_or_objects(count_only, nodes)
  end
end

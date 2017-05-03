class TreeBuilderReportReports < TreeBuilderReportReportsClass
  private

  def initialize(name, type, sandbox, build = true)
    @rpt_menu  = sandbox[:rpt_menu]
    @grp_title = sandbox[:grp_title]
    super(name, type, sandbox, build = true)
  end

  def tree_init_options(tree_name)
    {
      :leaf     => 'full_ids',
      :full_ids => true
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true)
  end

  def root_options
    {
      :title   => t = _("All Reports"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, options)
    objects = @rpt_menu.each_with_index.map do |r, i|
      # load next level of folders when building the tree
      @tree_state.x_tree(options[:tree])[:open_nodes].push("xx-#{i}")
      folder_hash(i.to_s, r[0], @grp_title == r[0])
    end
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    nodes = object[:full_id] ? object[:full_id].split('-') : object[:id].to_s.split('-')
    node_id = nodes.last.to_i
    if nodes.length == 1 && @rpt_menu[node_id][1].kind_of?(Array)
      child_names = @rpt_menu[node_id][1]
      return child_names.size if count_only
      child_names.each_with_index.map do |r, i|
        folder_hash("#{node_id}-#{i}", r[0], @grp_title == @rpt_menu[node_id][0])
      end
    elsif nodes.length >= 2
      el1 = nodes.length == 2 ? nodes[0].split('_').first.to_i : nodes[1].split('_').first.to_i
      child_names = @rpt_menu[el1][1][node_id][1]
      return child_names.size if count_only
      MiqReport.where(:name => child_names)
    end
  end

  def folder_hash(id, text, blue)
    {
      :id    => id,
      :text  => text,
      :icon  => "pficon #{blue ? 'pficon-folder-close-blue' : 'pficon-folder-close'}",
      :tip   => text
    }
  end
end

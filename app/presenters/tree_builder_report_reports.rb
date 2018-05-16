class TreeBuilderReportReports < TreeBuilderReportReportsClass
  REPORTS_IN_TREE = true

  private

  def initialize(name, type, sandbox, _build = true)
    @rpt_menu  = sandbox[:rpt_menu]
    @grp_title = sandbox[:grp_title]
    super(name, type, sandbox, build = true)
  end

  def tree_init_options(_tree_name)
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
      :text    => t = _("All Reports"),
      :tooltip => t
    }
  end

  # Get root node and all children report folders. (will call get_tree_custom_kids to get report details)
  def x_get_tree_roots(count_only, options)
    return @rpt_menu.size if count_only
    @rpt_menu.each_with_index.each_with_object({}) do |(r, node_id), a|
      # load next level of folders when building the tree
      @tree_state.x_tree(options[:tree])[:open_nodes].push("xx-#{node_id}")

      root_node = folder_hash(node_id.to_s, r[0], @grp_title == r[0])
      child_nodes = @rpt_menu[node_id][1].each_with_index.each.map do |child_r, child_id|
        folder_hash("#{node_id}-#{child_id}", child_r[0], @grp_title == @rpt_menu[node_id][0])
      end
      # returning a child hash says "there are no children"
      child_nodes = child_nodes.each_with_object({}) { |c, cn| cn[c] = {} } unless REPORTS_IN_TREE

      a[root_node] = child_nodes
    end
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    nodes = object[:full_id] ? object[:full_id].split('-') : object[:id].to_s.split('-')
    parent_id = nodes[-2].split('_').first.to_i
    node_id = nodes.last.to_i

    child_names = @rpt_menu[parent_id][1][node_id][1]
    count_only ? child_names.size : MiqReport.where(:name => child_names).order(:name)
  end

  def folder_hash(id, text, blue)
    {
      :id   => id,
      :text => text,
      :icon => "pficon #{blue ? 'pficon-folder-close-blue' : 'pficon-folder-close'}",
      :tip  => text
    }
  end
end

class TreeBuilderReportReports < TreeBuilderReportReportsClass
  REPORTS_IN_TREE = true

  include ReportHelper

  private

  def initialize(name, sandbox, build = true, **_params)
    @rpt_menu  = sandbox[:rpt_menu]
    @grp_title = reports_group_title
    super(name, sandbox, build)
  end

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Reports"),
      :tooltip => t
    }
  end

  # Get root node and all children report folders. (will call get_tree_custom_kids to get report details)
  def x_get_tree_roots
    @rpt_menu.each_with_index.each_with_object({}) do |(r, node_id), a|
      open_node("xx-#{node_id}")

      root_node = folder_hash(node_id.to_s, r[0], @grp_title == r[0])
      child_nodes = @rpt_menu[node_id][1].each_with_index.each.map do |child_r, child_id|
        folder_hash("#{node_id}-#{child_id}", child_r[0], @grp_title == @rpt_menu[node_id][0])
      end
      # returning a child hash says "there are no children"
      child_nodes = child_nodes.each_with_object({}) { |c, cn| cn[c] = {} } unless REPORTS_IN_TREE

      a[root_node] = child_nodes
    end
  end

  def x_get_tree_custom_kids(object, count_only)
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

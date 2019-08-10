class TreeBuilderAlertProfileAssign < TreeBuilder
  def initialize(name, sandbox, build, **params)
    @selected_nodes = params[:selected_nodes]
    # need to remove tree info
    TreeState.new(sandbox).remove_tree(name)
    super(name, sandbox, build)
  end

  def x_get_tree_roots(count_only)
    roots = ExtManagementSystem.assignable.each_with_object({}) do |ems, nodes|
      subtree = ems.children.flat_map(&:folders).each_with_object({}) do |folder, obj|
        obj.merge!(folder.subtree_arranged(:of_type => self.class::ANCESTRY_TYPE))
      end

      nodes.merge!(ems => subtree) if subtree.any?
    end

    count_only_or_objects(count_only, roots)
  end

  def tree_init_options
    {
      :full_ids   => true,
      :checkboxes => true,
      :oncheck    => "miqOnCheckGeneric",
      :check_url  => "/miq_policy/alert_profile_assign_changed/"
    }
  end
end

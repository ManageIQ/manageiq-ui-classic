class TreeBuilderGenealogy < TreeBuilder
  has_kids_for VmOrTemplate, [:x_get_vm_or_template_kids]

  def initialize(name, sandbox, build, **params)
    @root = params[:root]
    super(name, sandbox, build)
  end

  private

  # The tree name is the same for any genealogy tree, so it doesn't make sense to
  # load the selected node from the session.
  def active_node_set(tree_nodes)
    # Find the right node to be selected based on the @root.id
    selected = tree_nodes.first[:nodes].find do |node|
      self.class.extract_node_model_and_id(node[:key])[1] == @root.id.to_s
    end
    # If no node has been found, just select the root node
    selected ||= tree_nodes.first
    # Set it as the active node in the tree state
    @tree_state.x_node_set(selected[:key], @name)
  end

  def tree_init_options
    {
      :full_ids        => true,
      :checkboxes      => true,
      :open_all        => true,
      :silent_activate => true,
      :click_url       => "/vm/genealogy_tree_selected/",
      :onclick         => "miqOnClickGeneric",
      :oncheck         => "miqOnCheckGenealogy",
      :check_url       => "/vm/set_checked_items/"
    }
  end

  def vm_icon_image(vm)
    state = QuadiconHelper.machine_state(vm.normalized_state)
    {:icon => state[:fonticon], :iconBackground => state[:background]}
  end

  def root_options
    object = @root.parent.presence || @root
    {
      :text    => object.name,
      :tooltip => _("VM: %{name} (Click to view)") % {:name => object.name}
    }.merge(vm_icon_image(object))
  end

  def x_get_tree_roots
    kids = @root.parent.present? ? [@root] : @root.children
    count_only_or_objects(false, kids, :name)
  end

  def x_get_vm_or_template_kids(parent, count_only)
    count_only_or_objects(count_only, parent.children, :name)
  end
end

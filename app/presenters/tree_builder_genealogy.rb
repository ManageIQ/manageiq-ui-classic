class TreeBuilderGenealogy < TreeBuilder
  has_kids_for VmOrTemplate, [:x_get_vm_or_template_kids]

  def override(node, object, _pid, _options)
    if object == @root
      node[:highlighted] = true
    end
  end

  def initialize(name, type, sandbox, build, **params)
    @root = params[:root]
    super(name, type, sandbox, build)
  end

  private

  def tree_init_options
    {
      :full_ids   => true,
      :checkboxes => true,
      :open_all   => true,
      :click_url  => "/vm/genealogy_tree_selected/",
      :onclick    => "miqOnClickGeneric",
      :oncheck    => "miqOnCheckGenealogy",
      :check_url  => "/vm/set_checked_items/"
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

  def x_get_tree_roots(count_only, _options)
    kids = @root.parent.present? ? [@root] : @root.children
    count_only_or_objects(count_only, kids, :name)
  end

  def x_get_vm_or_template_kids(parent, count_only)
    count_only_or_objects(count_only, parent.children, :name)
  end
end

class TreeBuilderGenealogy < TreeBuilder
  has_kids_for VmOrTemplate, [:x_get_vm_or_template_kids]

  def override(node, object, _pid, _options)
    if object == @root
      node[:text] = _("%{item} (Selected)") % {:item => node[:text]}
      node[:highlighted] = true
      node[:expand] = true
    end
  end

  def initialize(name, type, sandbox, build, **params)
    @root = params[:root]
    super(name, type, sandbox, build)
  end

  def root_id
    @root.parent.present? ? @root.parent.id : @root.id
  end

  private

  def tree_init_options
    {
      :full_ids   => true,
      :checkboxes => true,
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
    if @root.parent.present?
      {:text    => @root.parent.name + _(" (Parent)"),
       :tooltip => _("VM: %{name} (Click to view)") % {:name => @root.parent.name}}.merge(vm_icon_image(@root.parent))
    else
      {:text    => @root.name,
       :tooltip => _("VM: %{name} (Click to view)") % {:name => @root.name}}.merge(vm_icon_image(@root))
    end
  end

  def x_get_tree_roots(count_only, _options)
    kids = @root.parent.present? ? [@root] : @root.children
    count_only_or_objects(count_only, kids, :name)
  end

  def x_get_vm_or_template_kids(parent, count_only)
    count_only_or_objects(count_only, parent.children, :name)
  end
end

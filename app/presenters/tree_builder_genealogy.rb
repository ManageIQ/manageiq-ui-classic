class TreeBuilderGenealogy < TreeBuilder
  has_kids_for VmOrTemplate, [:x_get_vm_or_template_kids]

  def override(node, object, _pid, _options)
    if object == @vm
      node[:text] = _("%{item} (Selected)") % {:item => node[:text]}
      node[:highlighted] = true
      node[:expand] = true
    end
  end

  def initialize(name, type, sandbox, build, vm)
    @vm = vm
    super(name, type, sandbox, build)
  end

  def root_id
    @vm.parent.present? ? @vm.parent.id : @vm.id
  end

  private

  def tree_init_options(_tree_name)
    {:full_ids => true, :lazy => false}
  end

  def set_locals_for_render
    super.merge!(
      :click_url  => "/vm/genealogy_tree_selected/",
      :onclick    => "miqOnClickGeneric",
      :checkboxes => true,
      :oncheck    => "miqOnCheckGenealogy",
      :check_url  => "/vm/set_checked_items/"
    )
  end

  def vm_icon_image(vm)
    state = QuadiconHelper.machine_state(vm.normalized_state)
    {:icon => state[:fonticon], :iconBackground => state[:background]}
  end

  def root_options
    if @vm.parent.present?
      {:text    => @vm.parent.name + _(" (Parent)"),
       :tooltip => _("VM: %{name} (Click to view)") % {:name => @vm.parent.name}}.merge(vm_icon_image(@vm.parent))
    else
      {:text    => @vm.name,
       :tooltip => _("VM: %{name} (Click to view)") % {:name => @vm.name}}.merge(vm_icon_image(@vm))
    end
  end

  def x_get_tree_roots(count_only, _options)
    kids = @vm.parent.present? ? [@vm] : @vm.children
    count_only_or_objects(count_only, kids, :name)
  end

  def x_get_vm_or_template_kids(parent, count_only)
    count_only_or_objects(count_only, parent.children, :name)
  end
end

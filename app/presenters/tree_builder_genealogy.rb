class TreeBuilderGenealogy< TreeBuilder
  has_kids_for VmOrTemplate, [:x_get_vm_or_template_kids]

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
        :click_url                 => "/vm/vmtree_selected/",
        :onclick                   => "miqOnClickGenealogyTree",
        :checkboxes                => true,
        :oncheck                   => "miqGetChecked",
        #:reselect_node             => @vm TODO
        :check_url                 => "/vm/set_checked_items/"
    )
  end

  def vm_image(vm)
    if vm.template?
      image = vm.host ? "template" : "template-no-host"
    elsif vm.retired
      image = 'retired'
    else
      image = vm.current_state.downcase
    end
    "100/#{image}.png"
  end

  def root_options
    if @vm.parent.present?
      [@vm.parent.name + _(" (Parent)"), _("VM: %{name} (Click to view)") % {:name => @vm.parent.name}, vm_image(@vm.parent)]
    else
      [@vm.name , _("VM: %{name} (Click to view)") % {:name => @vm.name}, vm_image(@vm)]
    end
  end

  def x_get_tree_roots(count_only = false, _options)
    kids = @vm.parent.present? ? [@vm] : @vm.children
    count_only_or_objects(count_only, kids, :name)
  end

  def x_get_vm_or_template_kids(parent, count_only)
    count_only_or_objects(count_only, parent.children, :name)
  end
end
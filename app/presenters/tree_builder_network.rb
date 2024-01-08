class TreeBuilderNetwork < TreeBuilder
  has_kids_for Lan, [:x_get_tree_lan_kids]
  has_kids_for Switch, [:x_get_tree_switch_kids]

  def override(node, object)
    node.selectable = false unless object.kind_of?(::VmOrTemplate)
  end

  def initialize(name, sandbox, build = true, **params)
    @root = params[:root]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {:full_ids => true, :lazy => true, :onclick => "miqOnClickHostNet"}
  end

  def root_options
    {
      :text       => @root.name,
      :tooltip    => _("Host: %{name}") % {:name => @root.name},
      :icon       => 'pficon pficon-container-node',
      :selectable => false
    }
  end

  def x_get_tree_roots
    Rbac.filtered(@root.switches)
  end

  def x_get_tree_switch_kids(parent, count_only)
    count_only_or_objects_filtered(count_only, parent.guest_devices) + count_only_or_objects_filtered(count_only, parent.lans)
  end

  def x_get_tree_lan_kids(parent, count_only)
    if parent.respond_to?(:vms_and_templates)
      count_only_or_objects_filtered(count_only, parent.vms_and_templates, "name")
    else
      count_only ? 0 : []
    end
  end
end

class TreeBuilderStorageAdapters < TreeBuilder
  has_kids_for GuestDevice, [:x_get_tree_guest_device_kids]
  has_kids_for MiqScsiTarget, [:x_get_tree_target_kids]

  def initialize(name, sandbox, build = true, **params)
    sandbox[:sa_root] = params[:root] if params[:root]
    @root = sandbox[:sa_root]
    super(name, sandbox, build)
  end

  def override(node, _object)
    node[:selectable] = false
  end

  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => @root.name,
      :tooltip => _("Host: %{name}") % {:name => @root.name},
      :icon    => "pficon pficon-container-node"
    }
  end

  def x_get_tree_roots(count_only)
    kids = count_only ? 0 : []
    unless @root.hardware.storage_adapters.empty?
      kids = count_only_or_objects(count_only, @root.hardware.storage_adapters)
    end
    kids.reverse unless count_only
    kids
  end

  def x_get_tree_guest_device_kids(parent, count_only = false)
    count_only_or_objects(count_only, parent.miq_scsi_targets)
  end

  def x_get_tree_target_kids(parent, count_only)
    count_only_or_objects(count_only, parent.miq_scsi_luns)
  end
end

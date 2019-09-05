class TreeBuilderSnapshots < TreeBuilder
  has_kids_for Snapshot, [:x_get_tree_snapshot_kids]

  attr_reader :selected_node

  def initialize(name, sandbox, build = true, **params)
    @record = params[:root]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :full_ids        => true,
      :lazy            => true,
      :onclick         => 'miqOnClickSnapshots',
      :silent_activate => true,
      :open_all        => true
    }
  end

  def root_options
    {
      :text       => @record.name,
      :tooltip    => @record.name,
      :icon       => 'pficon pficon-virtual-machine',
      :selectable => false
    }
  end

  # The tree name is the same for any snapshot tree, so it doesn't make sense to load the selected
  # node from the session. This method tries to find the active snapshot based on its suffix.
  # FIXME: deciding based on the string is not ideal, it should be evaluated on the node object instead
  def active_node_set(tree_nodes)
    stack = [tree_nodes.last]
    while stack.any?
      node = stack.pop
      # If the node's text has an active suffix, return with it
      if node.try(:[], :text).try(:ends_with?, " (#{_('Active')})")
        active = node
        break
      end

      stack.push(node[:nodes].last) if node[:nodes].try(:any?)
    end
    # Set it as the active node in the tree state
    # If no active snapshot has been found, return with the last node
    @tree_state.x_node_set(active.try(:[], :key) || node[:key], @name)
  end

  def x_get_tree_roots
    root_kid = @record.snapshots.present? ? @record.snapshots.find_all { |x| x.parent_id.nil? } : []
    count_only_or_objects(false, root_kid)
  end

  def x_get_tree_snapshot_kids(parent, count_only)
    kids = parent.children.presence || []
    count_only_or_objects(count_only, kids)
  end
end

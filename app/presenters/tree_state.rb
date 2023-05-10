class TreeState
  include Mixins::Sandbox

  def initialize(sandbox)
    @sb = sandbox
  end

  def add_tree(tree_params)
    name = tree_params[:tree]
    tree_params = @sb[:trees][name].reverse_merge(tree_params) if @sb.has_key_path?(:trees, name)
    @sb.store_path(:trees, name, tree_params)
  end

  def remove_tree(name)
    @sb[:trees].delete(name)
  end
end

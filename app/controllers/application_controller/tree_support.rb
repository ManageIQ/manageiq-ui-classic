module ApplicationController::TreeSupport
  extend ActiveSupport::Concern

  def tree_autoload
    assert_accordion_and_tree_privileges(x_active_tree)
    @edit ||= session[:edit] # Remember any previous @edit
    render :json => tree_add_child_nodes(params[:id])
  end

  def tree_add_child_nodes(id)
    tree_name = (params[:tree] || x_active_tree).to_sym
    tree_klass = x_tree(tree_name)[:klass_name]

    nodes = TreeBuilder.tree_add_child_nodes(:sandbox    => @sb,
                                             :klass_name => tree_klass,
                                             :name       => tree_name,
                                             :id         => id)
    TreeBuilder.convert_bs_tree(nodes)
  end

  def tree_exists?(tree_name)
    @sb[:trees].try(:key?, tree_name.to_s)
  end
end

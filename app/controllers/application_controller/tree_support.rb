module ApplicationController::TreeSupport
  extend ActiveSupport::Concern

  def tree_autoload
    @edit ||= session[:edit] # Remember any previous @edit
    render :json => tree_add_child_nodes(params[:id])
  end

  def tree_add_child_nodes(id)
    tree_name = (params[:tree] || x_active_tree).to_sym
    tree_type = tree_name.to_s.sub(/_tree$/, '').to_sym
    tree_klass = x_tree(tree_name)[:klass_name]

    # FIXME after euwe: build_ae_tree
    tree_type = :catalog if controller_name == 'catalog' && tree_type == :automate

    nodes = TreeBuilder.tree_add_child_nodes(:sandbox    => @sb,
                                             :klass_name => tree_klass,
                                             :name       => tree_name,
                                             :type       => tree_type,
                                             :id         => id)
    TreeBuilder.convert_bs_tree(nodes)
  end

  def tree_exists?(tree_name)
    @sb[:trees].try(:key?, tree_name.to_s)
  end
end

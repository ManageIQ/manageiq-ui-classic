# This is a highly experimental implementation of something that we would like to have probably in an UI-API
# It is definitely not a good example and it SHOULD NOT BE COPY-PASTED in any case
class TreeController < ApplicationController
  skip_after_action :set_global_session_data
  before_action :check_privileges

  def automate_entrypoint
    json = fetch_tree(TreeBuilderAutomateEntrypoint, :automate_entrypoint_tree, params[:id]) do |tree|
      if params[:fqname].present?
        MiqAeInstance.get_homonymic_across_domains_noprefix(current_user, params[:fqname], true).each do |instance|
          # Parse the namespace, class and instance from the fqname
          namespace, klass, instance, _ = MiqAeEngine::MiqAePath.split(instance.fqname)

          begin
            # Collect all the db records based on the parsed fqname
            open_nodes = namespace.split('/').each_with_object([]) do |ns, items|
              items << MiqAeNamespace.find_by!(:name => ns, :parent => items.last)
            end
            open_nodes << MiqAeClass.find_by!(:name => klass, :namespace_id => open_nodes.last.id)
            open_nodes << MiqAeInstance.find_by!(:name => instance, :class_id => open_nodes.last.id)
          rescue ActiveRecord::RecordNotFound
            # Skip the iteration steop if one of the records is not found
            # FIXME: we probably need foreign keys instead of this magic
            next
          else
            # Set the related tree nodes to open if all the records have been found
            open_nodes.each { |node| tree.open_node(TreeNode.new(node, {}).key) }
          end
        end
      end
    end
    render :body => json, :content_type => 'application/json'
  end

  def automate_inline_methods
    json = fetch_tree(TreeBuilderAutomateInlineMethod, :automate_inline_method_tree, params[:id])
    render :body => json, :content_type => 'application/json'
  end

  private

  # This method returns with a JSON that can be directly consumed by a frontend
  # treeview component. If a node_id is set, it only returns the subtree under
  # the node represented by this id. There's also an option to pass a block to
  # the method and customize the tree before building it. This way we can easily
  # define custom behavior without creating an if/else spaghetti.
  def fetch_tree(klass, name, node_id = nil)
    tree = klass.new(name, {}, false)

    # FIXME: maybe here we would need instance_exec/eval instead
    yield(tree) if block_given?

    tree.reload!

    if node_id
      TreeBuilder.convert_bs_tree(tree.x_get_child_nodes(node_id)).to_json
    else
      tree.instance_variable_get(:@bs_tree)
    end
  end
end

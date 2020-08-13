# This is a highly experimental implementation of something that we would like to have probably in an UI-API
# It is definitely not a good example and it SHOULD NOT BE COPY-PASTED in any case
class TreeController < ApplicationController
  skip_after_action :set_global_session_data
  before_action :check_privileges

  def automate_entrypoint
    fqname = params[:fqname]
    json = fetch_tree(TreeBuilderAutomateEntrypoint, :automate_entrypoint_tree, params[:id]) do |tree|
      open_nodes_hierarchy(tree, fqname) if fqname.present?
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
      tree.x_get_child_nodes(node_id).to_json
    else
      tree.instance_variable_get(:@bs_tree)
    end
  end

  def open_nodes_hierarchy(tree, fqname)
    open_nodes = automate_find_hierarchy(fqname)
    open_nodes = open_nodes.flat_map do |node|
      ns = node.ae_class.ae_namespace
      ns.ancestors + [ns, node.ae_class, node]
    end
    open_node_hierarchy(tree, open_nodes)
  end

  # @param fqname [String] the fqname or the relative_path
  # @returns [Array[MiqAeInstance], MiqAeInstance]
  #   single node if an fqname was specified (domain name at beginning)
  #   multiple nodes if a relative path was specified
  def automate_find_hierarchy(fqname)
    fqname = fqname[1..-1] if fqname[0] == '/'
    domain_name, *paths = fqname.downcase.split("/")
    relative_path = paths.join("/")

    nodes = MiqAeInstance.includes(:ae_class => :ae_namespace)
                         .where(:lower_relative_path => [relative_path, fqname.downcase]).load
    domain = MiqAeDomain.find_by(:lower_name => domain_name)

    # not a valid domain means relative path was passed in
    return nodes unless domain

    if (node = find_exact_match(nodes, domain, relative_path))
      # fqname was a fqname - return a single node
      [node]
    else
      # passed a relative path even though namespace looked like a domain
      nodes
    end
  end

  def find_exact_match(nodes, domain, relative_path)
    nodes.detect do |node|
      node.domain_id == domain.id && node.lower_relative_path == relative_path
    end
  end

  # Set the hierarchical tree nodes to open
  def open_node_hierarchy(tree, items)
    return if items.blank?

    items.each { |node| tree.open_node(TreeNode.new(node).key) }
  end
end

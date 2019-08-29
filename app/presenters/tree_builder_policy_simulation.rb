class TreeBuilderPolicySimulation < TreeBuilder
  # exp_build_string method needed
  include ApplicationController::ExpressionHtml

  has_kids_for Hash, [:x_get_tree_hash_kids]

  def initialize(name, sandbox, build = true, **params)
    @data = params[:root]
    @root_name = params[:root_name]
    @policy_options = params[:options]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {:full_ids => true}
  end

  def root_options
    {
      :text       => ViewHelper.content_tag(:strong, @root_name),
      :tooltip    => @root_name,
      :icon       => 'pficon pficon-virtual-machine',
      :selectable => false
    }
  end

  def node_icon(result)
    case result
    when "allow" then 'pficon pficon-ok'
    when "N/A"   then 'fa fa-ban'
    else              'pficon-error-circle-o'
    end
  end

  def reject_na_nodes(nodes)
    nodes.reject do |node|
      !@policy_options[:out_of_scope] && node["result"] == "N/A"
    end
  end

  def x_get_tree_roots
    nodes = if @data.present?
              reject_na_nodes(@data).map do |node|
                {:id         => node['id'],
                 :text       => prefixed_title(_('Policy Profile'), node['description']),
                 :icon       => node_icon(node["result"]),
                 :tip        => node['description'],
                 :selectable => false,
                 :policies   => node['policies']}
              end
            else
              [{:id => nil, :text => _("Items out of scope"), :icon => 'fa fa-ban', :selectable => false}]
            end
    count_only_or_objects(false, nodes)
  end

  def node_out_of_scope?(node)
    @policy_options[:out_of_scope] && node["result"] != "N/A"
  end

  def node_not_allowed?(node)
    @policy_options[:passed] && node["result"] != "allow"
  end

  def node_fails?(node)
    !@policy_options[:passed] && @policy_options[:failed] && node["result"] != "deny"
  end

  def skip_node?(node)
    !(node_out_of_scope?(node) || node_not_allowed?(node) || node_fails?(node))
  end

  def get_active_caption(node)
    node["active"] ? "" : _(" (Inactive)")
  end

  def policy_nodes(parent)
    parent[:policies].reject { |node| skip_node?(node) }.sort_by { |a| a["description"] }.map do |node|
      active_caption = get_active_caption(node)
      {:id         => node['id'],
       :text       => prefixed_title(_('Policy%{caption}') % {:caption => active_caption}, node['description']),
       :icon       => node_icon(node["result"]),
       :tip        => node['description'],
       :scope      => node['scope'],
       :conditions => node['conditions'],
       :selectable => false}
    end
  end

  def condition_node(parent)
    nodes = reject_na_nodes(parent[:conditions])
    nodes = nodes.sort_by { |a| a["description"] }.map do |node|
      {:id         => node['id'],
       :text       => prefixed_title(_('Condition'), node['description']),
       :icon       => node_icon(node["result"]),
       :tip        => node['description'],
       :scope      => node['scope'],
       :expression => node["expression"],
       :selectable => false}
    end
    nodes.compact
  end

  def scope_node(parent)
    icon = parent[:scope]["result"] ? "pficon pficon-ok" : "fa fa-ban"
    text, tip = exp_build_string(parent[:scope])
    {:id => nil, :text => prefixed_title(_('Scope'), text), :icon => icon, :tip => tip, :selectable => false}
  end

  def expression_node(parent)
    icon = parent[:expression]["result"] ? "pficon pficon-ok" : "fa fa-ban"
    text, tip = exp_build_string(parent[:expression])
    {:id => nil, :text => prefixed_title(_('Expression'), text), :icon => icon, :tip => tip, :selectable => false}
  end

  def get_correct_node(parent, node_name)
    if node_name == :scope
      scope_node(parent)
    elsif node_name == :expression
      expression_node(parent)
    end
  end

  def push_node(parent, node_name, nodes)
    if parent[node_name].present? && @policy_options[:out_of_scope] && parent[node_name]["result"] != "N/A"
      nodes.push(get_correct_node(parent, node_name))
    end
  end

  def x_get_tree_hash_kids(parent, count_only)
    nodes = []
    nodes.concat(policy_nodes(parent)) if parent[:policies].present?
    nodes.concat(condition_node(parent)) if parent[:conditions].present?
    push_node(parent, :scope, nodes)
    push_node(parent, :expression, nodes)
    count_only_or_objects(count_only, nodes)
  end
end

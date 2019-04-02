class TreeBuilderComplianceHistory < TreeBuilder
  has_kids_for Compliance, [:x_get_compliance_kids]
  has_kids_for ComplianceDetail, %i(x_get_compliance_detail_kids parents)

  def override(node, _object, _pid, _options)
    node[:selectable] = false
  end

  def initialize(name, type, sandbox, build = true, **params)
    sandbox[:ch_root] = TreeBuilder.build_node_id(params[:root]) if params[:root]
    @root = params[:root]
    unless @root
      model, id = TreeBuilder.extract_node_model_and_id(sandbox[:ch_root])
      @root = model.constantize.find_by(:id => id)
    end
    super(name, type, sandbox, build)
  end

  private

  def tree_init_options
    {:full_ids => true}
  end

  def x_get_tree_roots(count_only = false, _options = {})
    count_only_or_objects(count_only, @root.compliances.order("timestamp DESC").limit(10))
  end

  def x_get_compliance_kids(parent, count_only)
    kids = []
    if parent.compliance_details.empty?
      kid = {:id         => "#{parent.id}-nopol",
             :text       => _("No Compliance Policies Found"),
             :icon       => "fa fa-ban",
             :tip        => nil,
             :selectable => false}
      kids.push(kid)
    else
      # node must be unique
      parent.compliance_details.order("miq_policy_desc, condition_desc").each do |node|
        kids.push(node) unless kids.find { |s| s.miq_policy_id == node.miq_policy_id }
      end
    end
    count_only_or_objects(count_only, kids)
  end

  def get_policy_elm(parent, node)
    {:id         => "#{parent.id}-p_#{node.miq_policy_id}",
     :text       => prefixed_title(_('Condition'), node.condition_desc),
     :icon       => node.condition_result ? "pficon pficon-ok" : "pficon pficon-error-circle-o",
     :tip        => nil,
     :selectable => false}
  end

  def x_get_compliance_detail_kids(parent, count_only, parents)
    kids = []
    model, id = TreeBuilder.extract_node_model_and_id(parents.first)
    grandpa = model.constantize.find_by(:id => id)
    grandpa.compliance_details.order("miq_policy_desc, condition_desc").each do |node|
      next unless node.miq_policy_id == parent.miq_policy_id
      kids.push(get_policy_elm(parent, node))
    end
    count_only_or_objects(count_only, kids)
  end

  def x_get_tree_custom_kids(_parent, count_only, _options)
    count_only ? 0 : []
  end
end

module TreeNode
  class MiqProductFeature < TreeNode::Menu::Node
    set_attribute(:key) { "#{@tree.node_id_prefix}__#{@object.identifier}" }
    set_attribute(:text) { _(@object.name) }
    set_attribute(:tooltip) { _(@object.description) || _(@object.name) }
    set_attribute(:checked) do
      @tree.features.include?('everything') || @tree.features.include?(@object.identifier.sub(/_accords$/, ''))
    end

    set_attribute(:icon) do
      case @object.feature_type
      when 'view'
        'fa fa-search'
      when 'control'
        'fa fa-shield'
      when 'admin'
        'pficon pficon-edit'
      else
        'pficon pficon-folder-close'
      end
    end
  end
end

module TreeNode
  # Current assumption is that this builder would only be used in Rbac Features tree
  #
  class MiqProductFeature < TreeNode::Menu::Node
    set_attribute(:key)      { "#{@options[:node_id_prefix]}__#{@object.identifier}" }
    set_attribute(:title)    { _(@object.name) }
    set_attribute(:tooltip)  { _(@object.description) || _(@object.name) }
    set_attribute(:selected) { self_selected? || parent_selected? || select_by_children_selected }

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

    def children
      ::MiqProductFeature.obj_feature_all_children(@object.identifier).map do |child|
        TreeNode::MiqProductFeature.new(child, key, @options)
      end
    end

    private

    def self_selected?
      @options[:features].include?(@object.identifier.sub(/_accords$/, ''))
    end

    def parent_selected?
      parent = ::Menu::Manager.item(@parent_id.split('_').last)

      if parent.nil?
        # not a Menu::Item, try something else.
        ::MiqProductFeature.obj_feature_ancestors(@object.identifier).any? do |feature|
          @options[:features].include?(feature)
        end
      else
        TreeNode::Menu::Item.new(parent, nil, @options).self_selected?
      end
    end
  end
end

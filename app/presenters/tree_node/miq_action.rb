module TreeNode
  class MiqAction < Node
    set_attribute(:title, &:description)
    set_attribute(:icon) do
      if @options[:tree] != :action_tree
        if @options[:tree] == :policy_profile_tree
          policy_id = @parent_id.split('-')[2].split('_').first
          event_id  = @parent_id.split('-').last
        else
          policy_id = @parent_id.split('_')[2].split('-').last
          event_id  = @parent_id.split('_').last.split('-').last
        end
        p  = ::MiqPolicy.find_by_id(ApplicationRecord.uncompress_id(policy_id))
        ev = ::MiqEventDefinition.find_by_id(ApplicationRecord.uncompress_id(event_id))

        p.action_result_for_event(@object, ev) ? "pficon pficon-ok" : "pficon pficon-error-circle-o"
      else
        @object.decorate.fonticon
      end
    end
  end
end

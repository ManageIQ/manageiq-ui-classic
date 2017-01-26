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
      elsif @object.action_type == "default"
        "product product-action"
      else
        case @object.action_type
        when 'assign_scan_profile'
          'fa fa-list-ul'
        when 'create_snapshot'
          'fa fa-camera'
        when 'custom_automation'
          'fa fa-recycle'
        when 'delete_snapshots_by_age'
          'fa fa-camera'
        when 'email'
          'fa fa-envelope-o'
        when 'evaluate_alerts'
          'pficon pficon-warning-triangle-o'
        when 'inherit_parent_tags'
          'fa fa-tags'
        when 'reconfigure_cpus'
          'fa pficon-cpu'
        when 'reconfigure_memory'
          'pficon pficon-memory'
        when 'remove_tags'
          'fa fa-tags'
        when 'script'
          'fa fa-file-text-o'
        when 'set_custom_attribute'
          'product product-attribute'
        when 'snmp_trap'
          'fa fa fa-envelope-o'
        when 'tag'
          'fa fa-tag'
        when 'vm_collect_running_processes'
          'fa fa-cogs'
        end
      end
    end
  end
end

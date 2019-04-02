class ApplicationHelper::Button::MiqActionModify < ApplicationHelper::Button::Basic
  needs :@view_context
  def role_allows_feature?
    super && role_allows?(:feature => 'event_edit')
  end

  def visible?
    @view_context.x_active_tree != :event_tree
  end

  def disabled?
    if any_policy_read_only?
      @error_message = case policy_type
                       when 'a'  then _('This Action belongs to a read only Policy and cannot be modified')
                       when 'ev' then _('This Event belongs to a read only Policy and cannot be modified')
                       end
    end
    @error_message.present?
  end

  private

  def any_policy_read_only?
    @view_context.x_node.split('_').any? do |level|
      node_type, id = level.split('-')
      node_type == 'p' && MiqPolicy.find(id).try(:read_only)
    end
  end

  def policy_type
    parse_nodetype_and_id(@view_context.x_node).first
  end
end

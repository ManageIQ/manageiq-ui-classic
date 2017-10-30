class ApplicationHelper::Button::GenericObjectDefinitionButtonDelete < ApplicationHelper::Button::Basic
  def visible?
    @display != 'generic_objects' && @cb_group.nil? && @cb.nil? && @cb_group_actions.nil?
  end

  def disabled?
    !@record.generic_objects.count.zero?
  end
end

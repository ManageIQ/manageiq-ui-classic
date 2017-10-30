class ApplicationHelper::Button::GenericObjectDefinitionButtonEdit < ApplicationHelper::Button::Basic
  def visible?
    !@display == 'generic_objects' || @cb_group.nil? && @cb.nil? && @cb_group_actions.nil?
  end
end

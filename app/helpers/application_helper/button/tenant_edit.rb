class ApplicationHelper::Button::TenantEdit < ApplicationHelper::Button::Basic
  def disabled?
    @record.try!(:source)
  end
end

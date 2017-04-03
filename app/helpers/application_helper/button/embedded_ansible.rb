class ApplicationHelper::Button::EmbeddedAnsible < ApplicationHelper::Button::Basic
  def disabled?
    super || ManageIQ::Providers::EmbeddedAnsible::Provider.all.length != 1
  end
end

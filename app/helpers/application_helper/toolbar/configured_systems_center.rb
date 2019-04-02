class ApplicationHelper::Toolbar::ConfiguredSystemsCenter < ApplicationHelper::Toolbar::Basic
  include ApplicationHelper::Toolbar::ConfiguredSystem::Foreman::LifecycleMixin
  include ApplicationHelper::Toolbar::ConfiguredSystem::Foreman::PolicyMixin
end

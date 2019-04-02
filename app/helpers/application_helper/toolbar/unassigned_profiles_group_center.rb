class ApplicationHelper::Toolbar::UnassignedProfilesGroupCenter < ApplicationHelper::Toolbar::Basic
  include ApplicationHelper::Toolbar::ConfiguredSystem::Foreman::LifecycleMixin
  include ApplicationHelper::Toolbar::ConfiguredSystem::Foreman::PolicyMixin
end

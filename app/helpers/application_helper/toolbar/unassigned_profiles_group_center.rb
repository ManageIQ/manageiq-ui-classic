class ApplicationHelper::Toolbar::UnassignedProfilesGroupCenter < ApplicationHelper::Toolbar::Basic
  include ApplicationHelper::Toolbar::ConfiguredSystem::ConfigurationManager::LifecycleMixin
  include ApplicationHelper::Toolbar::ConfiguredSystem::ConfigurationManager::PolicyMixin
end

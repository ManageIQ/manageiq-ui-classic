class ApplicationHelper::Toolbar::ConfiguredSystemsCenter < ApplicationHelper::Toolbar::Basic
  include ApplicationHelper::Toolbar::ConfiguredSystem::ConfigurationManager::LifecycleMixin
  include ApplicationHelper::Toolbar::ConfiguredSystem::ConfigurationManager::PolicyMixin
end

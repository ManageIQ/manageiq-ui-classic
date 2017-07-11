require 'more_core_extensions/core_ext/hash'
ActionController::Parameters.class_eval do
  include MoreCoreExtensions::Shared::Nested
end

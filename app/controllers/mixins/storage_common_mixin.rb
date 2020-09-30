module Mixins
  module StorageCommonMixin
    def model_feature_for_action(action)
      case action
      when :edit
        :ems_storage_new
      end
    end
  end
end

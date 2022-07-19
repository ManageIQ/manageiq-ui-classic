module Mixins
  module StorageCommonMixin
    def model_feature_for_action(action)
      case action
      when :edit
        :update
      end
    end
  end
end

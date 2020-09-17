module Mixins
  module GenericFeatureActionMixin
    # This function can be override by the controller to pass a different feature
    def edit_feature
      case model.name
      when "ManageIQ::Providers::StorageManager"
        # Only storage managers that can be added directly from the storage section can be edit.
        :ems_storage_new
      end
    end

    def model_feature_for_action(action)
      case action
      when :edit
        edit_feature
      end
    end
  end
end

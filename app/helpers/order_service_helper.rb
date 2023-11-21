module OrderServiceHelper
  def order_service_data(dialog)
    {
      :dialogId             => dialog[:dialog_id],
      :params => {
        :resourceActionId     => dialog[:resource_action_id],
        :targetId             => dialog[:target_id],
        :targetType           => dialog[:target_type],
        :realTargetType       => dialog[:real_target_type],
      },
      :urls => {
        :apiSubmitEndpoint    => dialog[:api_submit_endpoint],
        :apiAction            => dialog[:api_action],
        :cancelEndPoint       => dialog[:cancel_endpoint],
        :finishSubmitEndpoint => dialog[:finish_submit_endpoint],
        :openUrl              => dialog[:open_url],
      }
    }
  end
end

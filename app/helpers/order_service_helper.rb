module OrderServiceHelper
  def order_service_data(dialog)
    {

      :apiSubmitEndpoint    => dialog[:api_submit_endpoint],
      :apiAction            => dialog[:api_action],
      :cancelEndPoint       => dialog[:cancel_endpoint],
      :dialogId             => dialog[:dialog_id],
      :finishSubmitEndpoint => dialog[:finish_submit_endpoint],
      :openUrl              => dialog[:open_url],
      :resourceActionId     => dialog[:resource_action_id],
      :realTargetType       => dialog[:real_target_type],
      :targetId             => dialog[:target_id],
      :targetType           => dialog[:target_type],
    }
  end
end

module OrderServiceHelper
  # replace_data is the JSON string set by MiqRequestController#prov_copy, holding the values of the request being copied.
  def order_service_data(dialog, replace_data = nil)
    {
      :dialogId          => dialog[:dialog_id],
      :dialogReplaceData => parse_replace_data(replace_data),
      :params            => {
        :resourceActionId => dialog[:resource_action_id],
        :targetId         => dialog[:target_id],
        :targetType       => dialog[:target_type],
        :realTargetType   => dialog[:real_target_type],
      },
      :urls              => {
        :apiSubmitEndpoint    => dialog[:api_submit_endpoint],
        :apiAction            => dialog[:api_action],
        :cancelEndPoint       => dialog[:cancel_endpoint],
        :finishSubmitEndpoint => dialog[:finish_submit_endpoint],
        :openUrl              => dialog[:open_url],
      }
    }
  end

  private

  def parse_replace_data(replace_data)
    return replace_data if replace_data.kind_of?(Array)
    return [] if replace_data.blank?

    JSON.parse(replace_data)
  rescue JSON::ParserError
    []
  end
end

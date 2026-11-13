describe OrderServiceHelper do
  let(:dialog) do
    {
      :dialog_id              => 42,
      :resource_action_id     => 101,
      :target_id              => 321,
      :target_type            => 'service_template',
      :real_target_type       => 'ServiceTemplate',
      :api_submit_endpoint    => '/api/service_catalogs/7/service_templates/321',
      :api_action             => 'order',
      :cancel_endpoint        => '/catalog/explorer',
      :finish_submit_endpoint => '/miq_request/show_list',
      :open_url               => false,
    }
  end

  it "is available to every view through ApplicationHelper" do
    expect(ApplicationHelper.ancestors).to include(described_class)
  end

  describe "#order_service_data" do
    subject { helper.order_service_data(dialog) }

    it "returns the dialog ID under :dialogId" do
      expect(subject[:dialogId]).to eq(42)
    end

    it "maps snake_case params to camelCase under :params" do
      expect(subject[:params]).to eq(
        :resourceActionId => 101,
        :targetId         => 321,
        :targetType       => 'service_template',
        :realTargetType   => 'ServiceTemplate'
      )
    end

    it "maps snake_case urls to camelCase under :urls" do
      expect(subject[:urls]).to eq(
        :apiSubmitEndpoint    => '/api/service_catalogs/7/service_templates/321',
        :apiAction            => 'order',
        :cancelEndPoint       => '/catalog/explorer',
        :finishSubmitEndpoint => '/miq_request/show_list',
        :openUrl              => false
      )
    end

    it "returns an empty replace list when there is no data to replace" do
      expect(subject[:dialogReplaceData]).to eq([])
    end
  end

  describe "#order_service_data with replace data" do
    it "parses the JSON set by the copy request action" do
      json = [{:name => "vm_name", :value => "copy"}].to_json

      expect(helper.order_service_data(dialog, json)[:dialogReplaceData]).to eq([{"name" => "vm_name", "value" => "copy"}])
    end

    it "ignores replace data that is not valid JSON" do
      expect(helper.order_service_data(dialog, "{oops")[:dialogReplaceData]).to eq([])
    end
  end
end

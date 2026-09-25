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

  end
end

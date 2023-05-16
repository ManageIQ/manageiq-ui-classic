describe EmsPhysicalInfraDashboardService do
  let(:physical_infra1) do
    FactoryBot.create(:physical_infra,
                      :name     => "foo",
                      :hostname => "test1.com")
  end

  let(:physical_infra2) do
    FactoryBot.create(:physical_infra,
                      :name     => "bar",
                      :hostname => "test2.com")
  end

  context "aggregate_status_card" do
    it "should display either a single provider or sum of all providers" do
      FactoryBot.create(:lenovo_physical_server,
                        :name                  => "foo",
                        :ext_management_system => physical_infra1)
      FactoryBot.create(:lenovo_physical_server,
                        :name                  => "bar",
                        :ext_management_system => physical_infra2)

      multiple_providers_status_data = EmsPhysicalInfraDashboardService.new(nil, nil).aggregate_status_data

      expect(multiple_providers_status_data&.[](:aggStatus)&.[](:status)&.[](:count)).to eq(2)
      expect(multiple_providers_status_data&.[](:aggStatus)&.[](:status)&.[](:notifications)&.[](0)&.[](:count)).to eq(2)
      expect(multiple_providers_status_data&.[](:aggStatus)&.[](:attrData)&.[](2)&.[](:count)).to eq(2)
      expect(multiple_providers_status_data&.[](:aggStatus)&.[](:attrData)&.[](1)&.[](:count)).to eq(0)

      single_provider_status_data = EmsPhysicalInfraDashboardService.new(physical_infra1.id, nil).aggregate_status_data

      expect(single_provider_status_data&.[](:aggStatus)&.[](:status)&.[](:iconImage)).to be_truthy
      expect(single_provider_status_data&.[](:aggStatus)&.[](:attrData)&.[](2)&.[](:count)).to eq(1)
      expect(single_provider_status_data&.[](:aggStatus)&.[](:attrData)&.[](1)&.[](:count)).to eq(0)
    end
  end

  context "servers_group_data" do
    it "should show servers health from last 30 days only" do
      current_date = 29.days.ago.beginning_of_day.utc
      old_date = 31.days.ago

      FactoryBot.create(:lenovo_physical_server,
                        :name                  => "foo",
                        :created_at            => current_date,
                        :ext_management_system => physical_infra1)
      FactoryBot.create(:lenovo_physical_server,
                        :created_at            => old_date,
                        :name                  => "bar",
                        :ext_management_system => physical_infra2)
      FactoryBot.create(:lenovo_physical_server,
                        :name                  => "foo2",
                        :created_at            => old_date,
                        :ext_management_system => physical_infra1)
      FactoryBot.create(:lenovo_physical_server,
                        :created_at            => current_date,
                        :name                  => "bar2",
                        :ext_management_system => physical_infra2)
      providers_status_data_multiple_providers = EmsPhysicalInfraDashboardService.new(nil, nil).servers_group_data
      provider_status_data_single_provider = EmsPhysicalInfraDashboardService.new(physical_infra1.id, nil).servers_group_data

      expect(providers_status_data_multiple_providers
               &.[](:serversGroup)
               &.[](:availableServers)
               &.[](:columns)
               &.[](:available)).to eq(2)
      expect(provider_status_data_single_provider
               &.[](:serversGroup)
               &.[](:availableServers)
               &.[](:columns)
               &.[](:available)).to eq(1)
    end

    it "returns hash with nil values when no server is available" do
      physical_infra1
      physical_infra2
      providers_status_data_multiple_providers = EmsPhysicalInfraDashboardService.new(nil, nil).servers_group_data
      provider_status_data_single_provider = EmsPhysicalInfraDashboardService.new(physical_infra1.id, nil).servers_group_data
      expect(providers_status_data_multiple_providers[:serversGroup]).to eq(:availableServers => nil, :serversHealth => nil)
      expect(provider_status_data_single_provider[:serversGroup]).to eq(:availableServers => nil, :serversHealth => nil)
    end
  end
end

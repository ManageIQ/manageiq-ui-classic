describe EmsInfraDashboardService do
  context '#recentVms' do
    before do
      @ems1 = FactoryBot.create(:ems_infra)
      @vm1 = FactoryBot.create(:vm_infra, :ext_management_system => @ems1)
      @vm2 = FactoryBot.create(:vm_infra, :ext_management_system => @ems1, :created_on => 1.day.ago.utc)

      @host1 = FactoryBot.create(:host, :ext_management_system => @ems1)
      @host2 = FactoryBot.create(:host, :ext_management_system => @ems1, :created_on => 1.day.ago.utc)

      @ems2 = FactoryBot.create(:ems_infra)
      @vm3 = FactoryBot.create(:vm_infra, :ext_management_system => @ems2)

      @host4 = FactoryBot.create(:host, :ext_management_system => @ems2)
    end

    subject { EmsInfraDashboardService.new(@ems1.id, "ems_infra", EmsInfra) }

    it 'returns vms for a specified provider' do
      expect(subject.recent_vms_data[:recentResources][:xData].count).to eq(2)
      expect(subject.recent_vms_data[:recentResources][:yData].count).to eq(2)
    end

    it 'returns hosts for a specified provider' do
      expect(subject.recent_hosts_data[:recentResources][:xData].count).to eq(2)
      expect(subject.recent_hosts_data[:recentResources][:yData].count).to eq(2)
    end

    describe "#ems_utilization" do
      let(:user_admin)         { FactoryBot.create(:user_admin) }
      let(:rollup_timestamp)   { Time.zone.parse("2016-01-12T00:00:00.00000000") }
      let(:time_profile)       { FactoryBot.create(:time_profile_utc) }
      let(:other_region)       { FactoryBot.create(:miq_region) }
      let(:other_time_profile) { FactoryBot.create(:time_profile_utc, :in_other_region, :other_region => other_region) }

      before do
        EvmSpecHelper.create_guid_miq_server_zone
        User.current_user = user_admin
        Timecop.travel(rollup_timestamp)
        MiqRegion.seed
        FactoryGirl.create(:metric_rollup, :resource => @ems1, :capture_interval_name => 'daily', :derived_memory_used => 2.kilobytes, :timestamp => rollup_timestamp, :time_profile => time_profile)
        FactoryGirl.create(:metric_rollup, :resource => @ems1, :capture_interval_name => 'daily', :derived_memory_used => 2.kilobytes, :timestamp => rollup_timestamp, :time_profile => other_time_profile)
      end

      after do
        Timecop.return
      end

      subject { EmsInfraDashboardService.new(@ems1.id, User, EmsInfra) }

      it "skips duplicate metric rollups for calculation" do
        utilization_data = subject.ems_utilization
        expect(utilization_data[:memory][:used]).to eq(2)
      end
    end
  end
end

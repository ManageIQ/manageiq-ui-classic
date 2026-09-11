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
        FactoryBot.create(:metric_rollup, :resource => @ems1, :capture_interval_name => 'daily', :derived_memory_used => 2.kilobytes, :timestamp => rollup_timestamp, :time_profile => time_profile)
        FactoryBot.create(:metric_rollup, :resource => @ems1, :capture_interval_name => 'daily', :derived_memory_used => 2.kilobytes, :timestamp => rollup_timestamp, :time_profile => other_time_profile)
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

  describe '#cluster_storage_usage' do
    let(:ems) { FactoryBot.create(:ems_infra) }
    let(:cluster) { FactoryBot.create(:ems_cluster, :name => 'test-cluster', :ext_management_system => ems) }
    subject { EmsInfraDashboardService.new(ems.id, "ems_infra", EmsInfra) }

    # Helpers that build storage doubles with the supports? stub already applied.
    def supported_storage_double(total_space:, free_space:)
      s = double('Storage',
                 :total_space => total_space,
                 :free_space  => free_space,
                 :used_space  => total_space - free_space)
      allow(s).to receive(:respond_to?).and_return(true)
      allow(s).to receive(:supports?).and_return(false)
      allow(s).to receive(:supports?).with(:free_space).and_return(true)
      s
    end

    def unsupported_storage_double(total_space:)
      s = double('Storage',
                 :total_space => total_space,
                 :free_space  => 0,
                 :used_space  => total_space)
      allow(s).to receive(:respond_to?).and_return(true)
      allow(s).to receive(:supports?).and_return(false)
      allow(s).to receive(:supports?).with(:free_space).and_return(false)
      s
    end

    context 'with a mix of supported and unsupported datastores' do
      let(:supported_ds)   { supported_storage_double(:total_space => 2.gigabytes, :free_space => 1.gigabyte) }
      let(:unsupported_ds) { unsupported_storage_double(:total_space => 4.gigabytes) }

      before do
        allow(cluster).to receive(:storages).and_return([supported_ds, unsupported_ds])
        allow_any_instance_of(EmsInfra).to receive(:ems_clusters).and_return(
          double(:includes => [cluster])
        )
      end

      it 'returns one entry for the cluster' do
        expect(subject.cluster_storage_usage.length).to eq(1)
      end

      it 'excludes the unsupported datastore from the totals' do
        entry = subject.cluster_storage_usage.first
        # Only the supported storage (2 GiB total, 1 GiB free) should count
        expect(entry[:total]).to eq(2)
        # used = 2 GiB - 1 GiB = 1 GiB; percent = 0.5
        expect(entry[:percent]).to eq(0.5)
      end

      it 'sets the cluster node name and provider name' do
        entry = subject.cluster_storage_usage.first
        expect(entry[:node]).to eq('test-cluster')
        expect(entry[:provider]).to eq(ems.name)
      end
    end

    context 'when all datastores are unsupported' do
      let(:unsupported_ds) { unsupported_storage_double(:total_space => 4.gigabytes) }

      before do
        allow(cluster).to receive(:storages).and_return([unsupported_ds])
        allow_any_instance_of(EmsInfra).to receive(:ems_clusters).and_return(
          double(:includes => [cluster])
        )
      end

      it 'returns no entries for the cluster' do
        expect(subject.cluster_storage_usage).to be_empty
      end
    end

    context 'when the cluster has no datastores' do
      before do
        allow(cluster).to receive(:storages).and_return([])
        allow_any_instance_of(EmsInfra).to receive(:ems_clusters).and_return(
          double(:includes => [cluster])
        )
      end

      it 'returns no entries' do
        expect(subject.cluster_storage_usage).to be_empty
      end
    end

    context 'when all supported datastores have zero total_space' do
      let(:zero_ds) { supported_storage_double(:total_space => 0, :free_space => 0) }

      before do
        allow(cluster).to receive(:storages).and_return([zero_ds])
        allow_any_instance_of(EmsInfra).to receive(:ems_clusters).and_return(
          double(:includes => [cluster])
        )
      end

      it 'returns no entries (avoids division by zero)' do
        expect(subject.cluster_storage_usage).to be_empty
      end
    end
  end

  describe '#heatmaps' do
    let(:ems) { FactoryBot.create(:ems_infra) }
    subject { EmsInfraDashboardService.new(ems.id, "ems_infra", EmsInfra) }

    it 'includes a :clusterStorageUsage key in the returned hash' do
      expect(subject.heatmaps).to have_key(:clusterStorageUsage)
    end
  end
end

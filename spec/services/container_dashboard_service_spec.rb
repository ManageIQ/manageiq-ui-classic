describe ContainerDashboardService do
  let(:controller) { double(:current_user => double(:get_timezone => "UTC", :id => 123)) }
  let(:time_profile) { FactoryBot.create(:time_profile_utc) }

  before do
    MiqRegion.seed
    @zone = EvmSpecHelper.create_guid_miq_server_zone[2]
  end

  context "providers" do
    it "filters containers providers with zero entity count and sorts providers by type correctly" do
      ems = FactoryBot.create(:ems_openshift, :hostname => "test2.com")

      providers_data = ContainerDashboardService.new(ems.id, nil).providers[0]

      # Kubernetes should not appear
      providers_data.each do |p|
        expect(p[:iconImage]).not_to be_nil
        expect(p[:count]).to eq(1)
      end
    end
  end

  context "ems_utilization" do
    it "shows aggregated metrics from last 30 days only" do
      ems_openshift = FactoryBot.create(:ems_openshift, :zone => @zone)
      ems_kubernetes = FactoryBot.create(:ems_kubernetes, :zone => @zone)

      current_date = 7.days.ago.beginning_of_day.utc
      old_date = 35.days.ago

      current_metric_openshift = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp                => current_date,
        :derived_memory_used      => 1024,
        :derived_vm_numvcpus      => 2,
        :derived_memory_available => 2048,
        :cpu_usage_rate_average   => 100,
        :time_profile             => time_profile
      )

      current_metric_kubernetes = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp                => current_date,
        :derived_memory_used      => 512,
        :derived_vm_numvcpus      => 1,
        :derived_memory_available => 1024,
        :cpu_usage_rate_average   => 100,
        :time_profile             => time_profile
      )

      old_metric = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp                => old_date,
        :derived_memory_used      => 1024,
        :derived_vm_numvcpus      => 2,
        :derived_memory_available => 2048,
        :cpu_usage_rate_average   => 100,
        :time_profile             => time_profile
      )

      nil_fielded_metric = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp    => old_date,
        :time_profile => time_profile
      )

      ems_openshift.metric_rollups << current_metric_openshift
      ems_openshift.metric_rollups << old_metric
      ems_openshift.metric_rollups << nil_fielded_metric
      ems_kubernetes.metric_rollups << current_metric_kubernetes
      ems_kubernetes.metric_rollups << old_metric.dup
      ems_kubernetes.metric_rollups << nil_fielded_metric.dup

      node_utilization_all_providers = described_class.new(nil, controller).ems_utilization[:xy_data]
      node_utilization_single_provider = described_class.new(ems_openshift.id, controller).ems_utilization[:xy_data]

      expect(node_utilization_single_provider).to eq(
        :cpu    => {
          :used  => 2,
          :total => 2,
          :xData => [current_date],
          :yData => [2]
        },
        :memory => {
          :used  => 1,
          :total => 2,
          :xData => [current_date],
          :yData => [1]
        }
      )

      expect(node_utilization_all_providers).to eq(
        :cpu    => {
          :used  => 3,
          :total => 3,
          :xData => [current_date],
          :yData => [3.0]
        },
        :memory => {
          :used  => 2,
          :total => 3,
          :xData => [current_date],
          :yData => [1.5]
        }
      )
    end

    it "returns hash with nil values when no metrics available" do
      ems_openshift = FactoryBot.create(:ems_openshift, :zone => @zone)
      node_utilization_all_providers = described_class.new(nil, controller).ems_utilization[:xy_data]
      node_utilization_single_provider = described_class.new(ems_openshift.id, controller).ems_utilization[:xy_data]
      expect(node_utilization_all_providers).to eq(:cpu => nil, :memory => nil)
      expect(node_utilization_single_provider).to eq(:cpu => nil, :memory => nil)
    end
  end

  context "heatmaps" do
    it "shows aggregated metrics from last 30 days only" do
      ems_openshift = FactoryBot.create(:ems_openshift, :name => 'openshift', :zone => @zone)
      ems_kubernetes = FactoryBot.create(:ems_kubernetes, :name => 'kubernetes', :zone => @zone)

      @node1 = FactoryBot.create(:container_node, :name => 'node1')
      @node2 = FactoryBot.create(:container_node, :name => 'node2')
      @node3 = FactoryBot.create(:container_node, :name => 'node3')
      @node4 = FactoryBot.create(:container_node, :name => 'node4')
      ems_openshift.container_nodes << @node1 << @node2
      ems_kubernetes.container_nodes << @node3 << @node4

      [ems_kubernetes, ems_openshift].each do |p|
        p.container_nodes.each do |node|
          node.metric_rollups << FactoryBot.create(
            :metric_rollup_cm_hr,
            :timestamp                  => 1.hour.ago.utc,
            :cpu_usage_rate_average     => 90,
            :mem_usage_absolute_average => 90,
            :derived_vm_numvcpus        => 4,
            :net_usage_rate_average     => 90,
            :derived_memory_available   => 8192,
            :derived_memory_used        => 4096
          )
        end
      end

      heatmaps_all_providers = described_class.new(nil, controller).heatmaps
      heatmaps_single_provider = described_class.new(ems_openshift, controller).heatmaps

      expect(heatmaps_all_providers).to eq(
        :title           => "Node Utilization",
        :nodeCpuUsage    => [
          {
            :id       => @node1.id,
            :node     => "node1",
            :provider => "openshift",
            :total    => 4,
            :percent  => 0.9
          },
          {
            :id       => @node2.id,
            :node     => "node2",
            :provider => "openshift",
            :total    => 4,
            :percent  => 0.9
          },
          {
            :id       => @node3.id,
            :node     => "node3",
            :provider => "kubernetes",
            :total    => 4,
            :percent  => 0.9
          },
          {
            :id       => @node4.id,
            :node     => "node4",
            :provider => "kubernetes",
            :total    => 4,
            :percent  => 0.9
          }
        ],
        :nodeMemoryUsage => [
          {
            :id       => @node1.id,
            :node     => "node1",
            :provider => "openshift",
            :total    => 8192,
            :percent  => 0.9
          },
          {
            :id       => @node2.id,
            :node     => "node2",
            :provider => "openshift",
            :total    => 8192,
            :percent  => 0.9
          },
          {
            :id       => @node3.id,
            :node     => "node3",
            :provider => "kubernetes",
            :total    => 8192,
            :percent  => 0.9
          },
          {
            :id       => @node4.id,
            :node     => "node4",
            :provider => "kubernetes",
            :total    => 8192,
            :percent  => 0.9
          }
        ]
      )

      expect(heatmaps_single_provider).to eq(
        :title           => "Node Utilization",
        :nodeCpuUsage    => [
          {
            :id       => @node1.id,
            :node     => "node1",
            :provider => "openshift",
            :total    => 4,
            :percent  => 0.9
          },
          {
            :id       => @node2.id,
            :node     => "node2",
            :provider => "openshift",
            :total    => 4,
            :percent  => 0.9
          }
        ],
        :nodeMemoryUsage => [
          {
            :id       => @node1.id,
            :node     => "node1",
            :provider => "openshift",
            :total    => 8192,
            :percent  => 0.9
          },
          {
            :id       => @node2.id,
            :node     => "node2",
            :provider => "openshift",
            :total    => 8192,
            :percent  => 0.9
          }
        ]
      )
    end

    it "returns hash with nil values when no metrics available" do
      ems_openshift = FactoryBot.create(:ems_openshift, :zone => @zone)
      heatmaps_all_providers = described_class.new(nil, controller).heatmaps
      heatmaps_single_provider = described_class.new(ems_openshift.id, controller).heatmaps
      expect(heatmaps_all_providers).to eq(:nodeCpuUsage => nil, :nodeMemoryUsage => nil, :title => "Node Utilization")
      expect(heatmaps_single_provider).to eq(:nodeCpuUsage => nil, :nodeMemoryUsage => nil, :title => "Node Utilization")
    end

    # BZ: https://bugzilla.redhat.com/show_bug.cgi?id=1439671
    it "returns one metric per node in realtime case" do
      ems = FactoryBot.create(:ems_kubernetes, :name => 'kubernetes', :zone => @zone)

      @node1 = FactoryBot.create(:container_node, :name => 'node1')
      @node2 = FactoryBot.create(:container_node, :name => 'node2')

      ems.container_nodes << @node1 << @node2

      ems.container_nodes.each do |node|
        (1..10).each do |min|
          node.metrics << FactoryBot.create(
            :metric_container_node_rt,
            :timestamp                  => min.minute.ago.utc,
            :capture_interval           => 20,
            :cpu_usage_rate_average     => 10 * min,
            :mem_usage_absolute_average => 10 * min,
            :derived_vm_numvcpus        => 4,
            :net_usage_rate_average     => 90,
            :derived_memory_available   => 8192,
            :derived_memory_used        => 4096
          )
        end
      end

      heatmaps = described_class.new(nil, controller).heatmaps

      expect(heatmaps).to eq(
        :nodeCpuUsage    => [
          {
            :id       => @node1.id,
            :node     => "node1",
            :provider => "kubernetes",
            :total    => 4,
            :percent  => 0.1
          },
          {
            :id       => @node2.id,
            :node     => "node2",
            :provider => "kubernetes",
            :total    => 4,
            :percent  => 0.1
          }
        ],
        :nodeMemoryUsage => [
          {
            :id       => @node1.id,
            :node     => "node1",
            :provider => "kubernetes",
            :total    => 8192,
            :percent  => 0.1
          },
          {
            :id       => @node2.id,
            :node     => "node2",
            :provider => "kubernetes",
            :total    => 8192,
            :percent  => 0.1
          }
        ],
        :title           => "Node Utilization"
      )
    end
  end

  context "network trends" do
    it "shows daily network trends from last 30 days only" do
      ems_openshift = FactoryBot.create(:ems_openshift, :zone => @zone)
      ems_kubernetes = FactoryBot.create(:ems_kubernetes, :zone => @zone)

      previous_date = 8.days.ago.beginning_of_day.utc
      current_date = 7.days.ago.beginning_of_day.utc
      old_date = 35.days.ago

      previous_metric_openshift = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp              => previous_date,
        :net_usage_rate_average => 2000,
        :time_profile           => time_profile
      )

      current_metric_openshift = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp              => current_date,
        :net_usage_rate_average => 1000,
        :time_profile           => time_profile
      )

      current_metric_kubernetes = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp              => current_date,
        :net_usage_rate_average => 1500,
        :time_profile           => time_profile
      )

      old_metric = FactoryBot.create(
        :metric_rollup_cm_daily,
        :timestamp              => old_date,
        :net_usage_rate_average => 1500,
        :time_profile           => time_profile
      )

      ems_openshift.metric_rollups << previous_metric_openshift
      ems_openshift.metric_rollups << current_metric_openshift
      ems_openshift.metric_rollups << old_metric
      ems_kubernetes.metric_rollups << current_metric_kubernetes
      ems_kubernetes.metric_rollups << old_metric.dup

      daily_network_trends = described_class.new(nil, controller).network_metrics[:xy_data]
      daily_network_trends_single_provider = described_class.new(ems_openshift.id, controller).network_metrics[:xy_data]

      expect(daily_network_trends_single_provider).to eq(
        :xData => [previous_date, current_date],
        :yData => [2000, 1000]
      )

      expect(daily_network_trends).to eq(
        :xData => [previous_date, current_date],
        :yData => [2000, 2500]
      )
    end

    it "show daily hourly network trends from last 24 hours only" do
      ems_openshift = FactoryBot.create(:ems_openshift, :zone => @zone)
      ems_kubernetes = FactoryBot.create(:ems_kubernetes, :zone => @zone)

      previous_date = 3.hours.ago
      current_date = 2.hours.ago
      old_date = 2.days.ago

      previous_metric_openshift = FactoryBot.create(
        :metric_rollup_cm_hr,
        :timestamp              => previous_date,
        :net_usage_rate_average => 2000,
        :time_profile           => time_profile
      )

      current_metric_openshift = FactoryBot.create(
        :metric_rollup_cm_hr,
        :timestamp              => current_date,
        :net_usage_rate_average => 1000,
        :time_profile           => time_profile
      )

      current_metric_kubernetes = FactoryBot.create(
        :metric_rollup_cm_hr,
        :timestamp              => current_date,
        :net_usage_rate_average => 1500,
        :time_profile           => time_profile
      )

      old_metric = FactoryBot.create(
        :metric_rollup_cm_hr,
        :timestamp              => old_date,
        :net_usage_rate_average => 1500,
        :time_profile           => time_profile
      )

      nil_fields_metric = FactoryBot.create(
        :metric_rollup_cm_hr,
        :timestamp    => old_date,
        :time_profile => time_profile
      )

      ems_openshift.metric_rollups << previous_metric_openshift
      ems_openshift.metric_rollups << current_metric_openshift
      ems_openshift.metric_rollups << old_metric
      ems_openshift.metric_rollups << nil_fields_metric
      ems_kubernetes.metric_rollups << current_metric_kubernetes
      ems_kubernetes.metric_rollups << old_metric.dup
      ems_kubernetes.metric_rollups << nil_fields_metric.dup

      hourly_network_trends = described_class.new(nil, controller).network_metrics[:xy_data]
      hourly_network_trends_single_provider =
        described_class.new(ems_openshift.id, controller).network_metrics[:xy_data]

      expect(hourly_network_trends_single_provider).to eq(
        :xData => [previous_date.beginning_of_hour.utc, current_date.beginning_of_hour.utc],
        :yData => [2000, 1000]
      )

      expect(hourly_network_trends).to eq(
        :xData => [previous_date.beginning_of_hour.utc, current_date.beginning_of_hour.utc],
        :yData => [2000, 2500]
      )
    end

    it "returns hash with nil values when no metrics available" do
      ems_openshift = FactoryBot.create(:ems_openshift, :zone => @zone)
      hourly_network_trends = described_class.new(nil, controller).hourly_network_metrics
      hourly_network_trends_single_provider = described_class.new(ems_openshift.id, controller).hourly_network_metrics

      daily_network_trends = described_class.new(nil, controller).daily_network_metrics
      daily_network_trends_single_provider = described_class.new(ems_openshift.id, controller).daily_network_metrics

      expect(hourly_network_trends).to eq(nil)
      expect(hourly_network_trends_single_provider).to eq(nil)
      expect(daily_network_trends).to eq(nil)
      expect(daily_network_trends_single_provider).to eq(nil)
    end
  end
end

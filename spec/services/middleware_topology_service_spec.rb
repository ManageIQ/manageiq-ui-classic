describe MiddlewareTopologyService do
  let(:middleware_topology_service) { described_class.new(nil) }
  let(:long_id_0) { "/t;28026b36-8fe4-4332-84c8-524e173a68bf/f;e055631d-c1a5-4a2d-926a-1dfdcff5137c/r;Local~~" }
  let(:long_id_1) { "#{long_id_0}/r;Local~%2Fdeployment=hawkular-command-gateway-war.war" }
  let(:long_id_2) { "#{long_id_0}/r;Local~%2Fdeployment=hawkular-wildfly-agent-download.war" }
  let(:long_id_3) { "#{long_id_0}/r;Local~%2Fsubsystem%3Ddatasources%2Fdata-source%3DExampleDS" }
  let(:long_id_4) { "Local~/deployment=hawkular-wildfly-agent-download.war" }
  let(:long_id_5) { "Local~/deployment=hawkular-command-gateway-war.war" }
  let(:long_id_6) { "Local~/subsystem=datasources/data-source=ExampleDS" }
  let(:long_id_7) { "Local~/subsystem=messaging-activemq/server=default/jms-topic=HawkularMetricData" }
  let(:long_id_8) { "/t;28026b36-8fe4-4332-84c8-524e173a68bf/f;fabf8d822986/r;Local%20DMR~~" }
  let(:long_id_9) { "/t;28026b36-8fe4-4332-84c8-524e173a68bf/f;unused-4-252.brq.redhat.com/r;Local%20DMR~~" }

  describe "#build_topology" do
    subject { middleware_topology_service.build_topology }

    let(:ems_hawkular) { FactoryGirl.create(:ems_hawkular) }
    let!(:mw_server) do
      FactoryGirl.create(:hawkular_middleware_server,
                         :name                  => 'Local',
                         :feed                  => '70c798a0-6985-4f8a-a525-012d8d28e8a3',
                         :ems_ref               => long_id_0,
                         :nativeid              => 'Local~~',
                         :ext_management_system => ems_hawkular,
                         :properties            => { 'Calculated Server State' => 'running' })
    end

    let!(:mw_server_wildfly) do
      FactoryGirl.create(:hawkular_middleware_server_wildfly,
                         :name                  => 'Local DMR',
                         :feed                  => 'fabf8d822986',
                         :ems_ref               => long_id_0,
                         :nativeid              => 'Local DMR~~',
                         :ext_management_system => ems_hawkular,
                         :properties            => { 'Calculated Server State' => 'running' })
    end

    let!(:mw_server_eap) do
      FactoryGirl.create(:hawkular_middleware_server_eap,
                         :name                  => 'Local DMR',
                         :feed                  => 'unused-4-252.brq.redhat.com',
                         :ems_ref               => long_id_0,
                         :nativeid              => 'Local DMR~~',
                         :ext_management_system => ems_hawkular,
                         :product               => 'EAP',
                         :properties            => { 'Calculated Server State' => 'running', 'product' => 'EAP' })
    end

    before do
      allow(middleware_topology_service).to receive(:retrieve_providers).and_return([ems_hawkular])
    end

    it "topology contains the expected structure and content" do
      mw_deployment1 = MiddlewareDeployment.create(:ext_management_system => ems_hawkular,
                                                   :middleware_server     => mw_server,
                                                   :ems_ref               => long_id_2,
                                                   :name                  => "hawkular-wildfly-agent-download.war",
                                                   :nativeid              => long_id_4,
                                                   :status                => 'Enabled')

      mw_deployment2 = MiddlewareDeployment.create(:ext_management_system => ems_hawkular,
                                                   :middleware_server     => mw_server,
                                                   :ems_ref               => long_id_1,
                                                   :name                  => "hawkular-command-gateway-war.war",
                                                   :nativeid              => long_id_5,
                                                   :status                => 'Disabled')

      mw_datasource = MiddlewareDatasource.create(:ext_management_system => ems_hawkular,
                                                  :middleware_server     => mw_server,
                                                  :ems_ref               => long_id_3,
                                                  :name                  => "ExampleDS",
                                                  :nativeid              => long_id_6)

      mw_messaging = MiddlewareMessaging.create(:ext_management_system => ems_hawkular,
                                                :middleware_server     => mw_server,
                                                :ems_ref               => long_id_2,
                                                :name                  => "JMS Topic [HawkularMetricData]",
                                                :nativeid              => long_id_7)

      expect(subject[:items]).to include(
        "MiddlewareManager" + ems_hawkular.compressed_id.to_s      => {:name         => ems_hawkular.name,
                                                                       :status       => "Unknown",
                                                                       :kind         => "MiddlewareManager",
                                                                       :display_kind => "Hawkular",
                                                                       :miq_id       => ems_hawkular.id,
                                                                       :icon         => match(/vendor-hawkular/),
                                                                       :model        => ems_hawkular.class.name,
                                                                       :key          => "MiddlewareManager" + ems_hawkular.compressed_id.to_s}
      )

      expect(subject[:items]).to include(
        "MiddlewareServer" + mw_server.compressed_id.to_s          => {:name         => mw_server.name,
                                                                       :status       => "Running",
                                                                       :kind         => "MiddlewareServer",
                                                                       :display_kind => "MiddlewareServer",
                                                                       :miq_id       => mw_server.id,
                                                                       :icon         => match(/vendor-wildfly/),
                                                                       :model        => mw_server.class.name,
                                                                       :key          => "MiddlewareServer" + mw_server.compressed_id.to_s}
      )

      expect(subject[:items]).to include(
        "MiddlewareServerEap" + mw_server_eap.compressed_id.to_s   => {:name         => mw_server_eap.name,
                                                                       :status       => "Running",
                                                                       :kind         => "MiddlewareServerEap",
                                                                       :display_kind => "MiddlewareServerEap",
                                                                       :miq_id       => mw_server_eap.id,
                                                                       :icon         => match(/vendor-jboss-eap/),
                                                                       :model        => mw_server_eap.class.name,
                                                                       :key          => "MiddlewareServerEap" + mw_server_eap.compressed_id.to_s}
      )

      expect(subject[:items]).to include(
        "MiddlewareServerWildfly" + mw_server_wildfly.compressed_id.to_s => {:name         => mw_server_wildfly.name,
                                                                             :status       => "Running",
                                                                             :kind         => "MiddlewareServerWildfly",
                                                                             :display_kind => "MiddlewareServerWildfly",
                                                                             :miq_id       => mw_server_wildfly.id,
                                                                             :icon         => match(/vendor-wildfly/),
                                                                             :model        => mw_server_wildfly.class.name,
                                                                             :key          => "MiddlewareServerWildfly" + mw_server_wildfly.compressed_id.to_s}
      )

      expect(subject[:items]).to include(
        "MiddlewareDeployment" + mw_deployment1.compressed_id.to_s => {:name         => mw_deployment1.name,
                                                                       :status       => "Enabled",
                                                                       :kind         => "MiddlewareDeployment",
                                                                       :display_kind => "MiddlewareDeploymentWar",
                                                                       :miq_id       => mw_deployment1.id,
                                                                       :model        => mw_deployment1.class.name,
                                                                       :key          => "MiddlewareDeployment" + mw_deployment1.compressed_id.to_s}
      )

      expect(subject[:items]).to include(
        "MiddlewareDeployment" + mw_deployment2.compressed_id.to_s => {:name         => mw_deployment2.name,
                                                                       :status       => "Disabled",
                                                                       :kind         => "MiddlewareDeployment",
                                                                       :display_kind => "MiddlewareDeploymentWar",
                                                                       :miq_id       => mw_deployment2.id,
                                                                       :model        => mw_deployment2.class.name,
                                                                       :key          => "MiddlewareDeployment" + mw_deployment2.compressed_id.to_s}
      )

      expect(subject[:items]).to include(
        "MiddlewareDatasource" + mw_datasource.compressed_id.to_s  => {:name         => mw_datasource.name,
                                                                       :status       => "Unknown",
                                                                       :kind         => "MiddlewareDatasource",
                                                                       :display_kind => "MiddlewareDatasource",
                                                                       :miq_id       => mw_datasource.id,
                                                                       :model        => mw_datasource.class.name,
                                                                       :key          => "MiddlewareDatasource" + mw_datasource.compressed_id.to_s}
      )

      expect(subject[:items]).to include(
        "MiddlewareMessaging" + mw_messaging.compressed_id.to_s    => {:name         => mw_messaging.name,
                                                                       :status       => "Unknown",
                                                                       :kind         => "MiddlewareMessaging",
                                                                       :display_kind => "MiddlewareMessaging",
                                                                       :miq_id       => mw_messaging.id,
                                                                       :model        => mw_messaging.class.name,
                                                                       :key          => "MiddlewareMessaging" + mw_messaging.compressed_id.to_s}
      )

      expect(subject[:relations].size).to eq(7)
      expect(subject[:relations]).to include(
        {
          :source => "MiddlewareManager" + ems_hawkular.compressed_id.to_s,
          :target => "MiddlewareServer" + mw_server.compressed_id.to_s
        },
        {
          :source => "MiddlewareManager" + ems_hawkular.compressed_id.to_s,
          :target => "MiddlewareServerEap" + mw_server_eap.compressed_id.to_s
        },
        {
          :source => "MiddlewareManager" + ems_hawkular.compressed_id.to_s,
          :target => "MiddlewareServerWildfly" + mw_server_wildfly.compressed_id.to_s
        },
        {
          :source => "MiddlewareServer" + mw_server.compressed_id.to_s,
          :target => "MiddlewareDeployment" + mw_deployment1.compressed_id.to_s
        },
        {
          :source => "MiddlewareServer" + mw_server.compressed_id.to_s,
          :target => "MiddlewareDeployment" + mw_deployment2.compressed_id.to_s
        },
        {
          :source => "MiddlewareServer" + mw_server.compressed_id.to_s,
          :target => "MiddlewareDatasource" + mw_datasource.compressed_id.to_s
        },
        {
          :source => "MiddlewareServer" + mw_server.compressed_id.to_s,
          :target => "MiddlewareMessaging" + mw_messaging.compressed_id.to_s
        }
      )
    end

    it "topology renders unknown status if server state is not set" do
      mw_server.properties = nil
      mw_server.save!

      expect(subject[:items]).to include(
        "MiddlewareServer" + mw_server.compressed_id.to_s => {:name         => mw_server.name,
                                                              :status       => "Unknown",
                                                              :kind         => "MiddlewareServer",
                                                              :display_kind => "MiddlewareServer",
                                                              :miq_id       => mw_server.id,
                                                              :icon         => match(/vendor-wildfly/),
                                                              :model        => mw_server.class.name,
                                                              :key          => "MiddlewareServer" + mw_server.compressed_id.to_s}
      )
    end
  end
end

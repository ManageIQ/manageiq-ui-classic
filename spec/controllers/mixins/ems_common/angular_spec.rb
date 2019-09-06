describe Mixins::EmsCommon::Angular do
  context '.retrieve_event_stream_selection' do
    let(:network_controller) { EmsNetworkController.new }
    let(:ems_nuage) { FactoryBot.create(:ems_nuage_network_with_authentication) }
    let(:ems_openstack) { FactoryBot.create(:ems_openstack_with_authentication) }

    it 'when amqp' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp', :hostname => 'hostname')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('amqp')
    end

    it 'when ceilometer' do
      ems_openstack.endpoints << Endpoint.create(:role => 'ceilometer', :hostname => 'hostname')
      network_controller.instance_variable_set(:@ems, ems_openstack)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('ceilometer')
    end

    it 'when ceilometer and amqp has empty hostname' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'ceilometer', :hostname => 'hostname')
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('ceilometer')
    end

    it 'when amqp and ceilometer has empty hostname' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'ceilometer')
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp', :hostname => 'hostname')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('amqp')
    end

    it 'none when amqp and ceilometer have empty hostnames' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'ceilometer')
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('none')
    end

    it 'ceilometer when openstack provider when amqp and ceilometer have nil endpoints' do
      network_controller.instance_variable_set(:@ems, ems_openstack)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('ceilometer')
    end

    it 'when none' do
      # remove default endpoints
      ems_nuage.endpoints = []
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('none')
    end
  end

  describe 'get_task_args' do
    context 'openstack cloud' do
      before do
        @ems_cloud_controller = EmsCloudController.new
        @params = {
          :default_security_protocol => "ssl",
          :default_hostname          => "host_default",
          :default_api_port          => "13000",
          :default_userid            => "abc",
          :default_password          => "abc",
          :amqp_security_protocol    => "non_ssl",
          :amqp_hostname             => "host_amqp",
          :amqp_api_port             => "5462",
          :amqp_userid               => "xyz",
          :amqp_password             => "xyz"
        }
      end

      it "returns connect options for openstack cloud default tab" do
        @params[:cred_type] = "default"
        @ems_cloud_controller.params = @params

        expected_connect_options = ["v2:{XpADRTTI7f11hNT7AuDaKg==}",
                                    {:default_security_protocol => "ssl",
                                     :default_hostname          => "host_default",
                                     :default_api_port          => "13000",
                                     :default_userid            => "abc"}.with_indifferent_access]
        expect(@ems_cloud_controller.send(:get_task_args, 'ManageIQ::Providers::Openstack::CloudManager')).to eq(expected_connect_options)
      end

      it "returns connect options for openstack cloud AMQP tab" do
        @params[:cred_type] = "amqp"
        @ems_cloud_controller.params = @params

        expected_connect_options = ["v2:{k8Sm5ygvDAvvY5zkvev1ag==}",
                                    {:amqp_security_protocol => "non_ssl",
                                     :amqp_hostname          => "host_amqp",
                                     :amqp_api_port          => "5462",
                                     :amqp_userid            => "xyz"}.with_indifferent_access]
        expect(@ems_cloud_controller.send(:get_task_args, 'ManageIQ::Providers::Openstack::CloudManager')).to eq(expected_connect_options)
      end
    end

    context 'vmware cloud' do
      before do
        @ems_cloud_controller = EmsCloudController.new
        @params = {
          :default_hostname       => "host_default",
          :default_api_port       => "443",
          :default_userid         => "abc",
          :default_password       => "abc",
          :amqp_security_protocol => "non_ssl",
          :amqp_hostname          => "host_amqp",
          :amqp_api_port          => "5472",
          :amqp_userid            => "xyz",
          :amqp_password          => "xyz"
        }
      end

      it "returns connect options for vmware cloud default tab" do
        @params[:cred_type] = "default"
        @ems_cloud_controller.params = @params

        expected_connect_options = ["host_default", "443", "abc", "v2:{XpADRTTI7f11hNT7AuDaKg==}", nil, true]
        expect(@ems_cloud_controller.send(:get_task_args, 'ManageIQ::Providers::Vmware::CloudManager')).to eq(expected_connect_options)
      end

      it "returns connect options for vmware cloud AMQP tab" do
        @params[:cred_type] = "amqp"
        @ems_cloud_controller.params = @params

        expected_connect_options = ["host_amqp", "5472", "xyz", "v2:{k8Sm5ygvDAvvY5zkvev1ag==}", nil, true]
        expect(@ems_cloud_controller.send(:get_task_args, 'ManageIQ::Providers::Vmware::CloudManager')).to eq(expected_connect_options)
      end
    end

    context 'openstack infra' do
      before do
        @ems_infra_controller = EmsInfraController.new
        @params = {
          :default_security_protocol => "ssl",
          :default_hostname          => "host_default",
          :default_api_port          => "13000",
          :default_userid            => "abc",
          :default_password          => "abc",
          :amqp_security_protocol    => "non_ssl",
          :amqp_hostname             => "host_amqp",
          :amqp_api_port             => "5462",
          :amqp_userid               => "xyz",
          :amqp_password             => "xyz"
        }
      end

      it "returns connect options for openstack infra default tab" do
        @params[:cred_type] = "default"
        @ems_infra_controller.params = @params

        expected_connect_options = ["v2:{XpADRTTI7f11hNT7AuDaKg==}",
                                    {:default_security_protocol => "ssl",
                                     :default_hostname          => "host_default",
                                     :default_api_port          => "13000",
                                     :default_userid            => "abc"}.with_indifferent_access]
        expect(@ems_infra_controller.send(:get_task_args, 'ManageIQ::Providers::Openstack::InfraManager')).to eq(expected_connect_options)
      end

      it "returns connect options for openstack infra AMQP tab" do
        @params[:cred_type] = "amqp"
        @ems_infra_controller.params = @params

        expected_connect_options = ["v2:{k8Sm5ygvDAvvY5zkvev1ag==}",
                                    {:amqp_security_protocol => "non_ssl",
                                     :amqp_hostname          => "host_amqp",
                                     :amqp_api_port          => "5462",
                                     :amqp_userid            => "xyz"}.with_indifferent_access]
        expect(@ems_infra_controller.send(:get_task_args, 'ManageIQ::Providers::Openstack::InfraManager')).to eq(expected_connect_options)
      end
    end

    context 'vmware infra' do
      before do
        @ems_infra_controller = EmsInfraController.new
        @params = {
          :default_hostname => "host_default",
          :default_userid   => "abc",
          :default_password => "abc",
          :console_userid   => "xyz",
          :console_password => "xyz"
        }
      end

      it "returns connect options for vmware infra default tab" do
        @params[:cred_type] = "default"
        @ems_infra_controller.params = @params

        expected_connect_options = [{:pass       => "v2:{XpADRTTI7f11hNT7AuDaKg==}",
                                     :user       => "abc",
                                     :ip         => "host_default",
                                     :use_broker => false}]
        expect(@ems_infra_controller.send(:get_task_args, 'ManageIQ::Providers::Vmware::InfraManager')).to eq(expected_connect_options)
      end

      it "returns connect options for vmware infra console tab" do
        @params[:cred_type] = "console"
        @ems_infra_controller.params = @params

        expected_connect_options = [{:pass       => "v2:{k8Sm5ygvDAvvY5zkvev1ag==}",
                                     :user       => "xyz",
                                     :ip         => "host_default",
                                     :use_broker => false}]
        expect(@ems_infra_controller.send(:get_task_args, 'ManageIQ::Providers::Vmware::InfraManager')).to eq(expected_connect_options)
      end
    end

    context 'aws cloud' do
      before do
        @ems_cloud_controller = EmsCloudController.new
        @params = {
          :default_userid          => "abc",
          :default_password        => "abc",
          :default_url             => "http://abc.test/mypath",
          :default_service_account => "test_arn",
        }
        @ems = FactoryBot.create(:ems_amazon)
        allow(@ems).to receive(:to_s).and_return('ManageIQ::Providers::Amazon::CloudManager')
      end

      it "returns connect options for aws cloud" do
        @params[:cred_type] = "default"
        @ems_cloud_controller.params = @params

        expected_connect_options = [
          "abc",
          "v2:{XpADRTTI7f11hNT7AuDaKg==}",
          :EC2,
          nil,
          nil,
          true,
          URI.parse("http://abc.test/mypath"),
          :assume_role => "test_arn",
        ]
        expect(@ems_cloud_controller.send(:get_task_args, @ems)).to eq(expected_connect_options)
      end
    end

    context 'azure cloud' do
      before do
        @ems_cloud_controller = EmsCloudController.new
        @params = {
          :default_userid   => "abc",
          :default_password => "abc",
          :azure_tenant_id  => "77ecefb6-cff0-4e8d-a446-757a69cb9444",
          :subscription     => "2586c64b-38b4-4527-a140-012d49dfc444",
          :provider_region  => "East US",
          :default_url      => "http://abc.test/mypath"
        }
        @ems = FactoryGirl.create(:ems_azure)
        allow(@ems).to receive(:to_s).and_return('ManageIQ::Providers::Azure::CloudManager')
      end

      it "returns connect options for azure cloud" do
        @params[:cred_type] = "default"
        @ems_cloud_controller.params = @params

        expected_connect_options = ["abc", "v2:{XpADRTTI7f11hNT7AuDaKg==}", "77ecefb6-cff0-4e8d-a446-757a69cb9444", "2586c64b-38b4-4527-a140-012d49dfc444", nil, "East US", URI.parse("http://abc.test/mypath")]
        expect(@ems_cloud_controller.send(:get_task_args, @ems)).to eq(expected_connect_options)
      end
    end
  end
end

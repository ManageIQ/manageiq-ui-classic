require 'kubeclient'

describe EmsCloudController do
  context "::EmsCommon" do
    context "#new" do
      before do
        stub_user(:features => :all)
        allow(controller).to receive(:drop_breadcrumb)
      end

      it "assigns provider_regions" do
        controller.send(:new)

        regions = {
          # FIXME: (durandom) add a mock provider in order to remove this dependency on an actual provider
          'azure' => ManageIQ::Providers::Azure::Regions.all.sort_by { |r| r[:description] }.map do |r|
            [r[:description], r[:name]]
          end
        }
        expect(assigns(:provider_regions)).to include(regions)
      end
    end

    context "#button" do
      before(:each) do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
      end

      it "when Retire Button is pressed for a Cloud provider Instance" do
        allow(controller).to receive(:role_allows?).and_return(true)
        ems = FactoryGirl.create("ems_vmware")
        vm = FactoryGirl.create(:vm_vmware,
                                :ext_management_system => ems,
                                :storage               => FactoryGirl.create(:storage)
                               )
        post :button, :params => { :pressed => "instance_retire", "check_#{vm.id}" => "1", :format => :js, :id => ems.id, :display => 'instances' }
        expect(response.status).to eq 200
        expect(response.body).to include('vm/retire')
      end

      it "when Retire Button is pressed for an Orchestration Stack" do
        allow(controller).to receive(:role_allows?).and_return(true)
        ems = FactoryGirl.create("ems_amazon")
        ost = FactoryGirl.create(:orchestration_stack_cloud, :ext_management_system => ems)
        post :button, :params => { :pressed => "orchestration_stack_retire", "check_#{ost.id}" => "1", :format => :js, :id => ems.id, :display => 'orchestration_stacks' }
        expect(response.status).to eq 200
        expect(response.body).to include('orchestration_stack/retire')
      end

      it "when Delete Button is pressed for CloudObjectStoreContainer" do
        expect(controller).to receive(:process_cloud_object_storage_buttons)
        post :button, :params => { :pressed => "cloud_object_store_container_delete" }
      end
    end
  end

  describe "#download_summary_pdf" do
    let(:provider_openstack) { FactoryGirl.create(:provider_openstack, :name => "Undercloud") }
    let(:ems_openstack) { FactoryGirl.create(:ems_openstack, :name => "overcloud", :provider => provider_openstack) }
    let(:pdf_options) { controller.instance_variable_get(:@options) }

    context "download pdf file" do
      before :each do
        stub_user(:features => :all)
        allow(PdfGenerator).to receive(:pdf_from_string).with('', 'pdf_summary.css').and_return("")
        get :download_summary_pdf, :params => {:id => ems_openstack.id}
      end

      it "should not contains string 'ManageIQ' in the title of summary report" do
        expect(pdf_options[:title]).not_to include('ManageIQ')
      end

      it "should match proper title of report" do
        expect(pdf_options[:title]).to eq('Cloud Provider (OpenStack) "overcloud"')
      end
    end
  end
end

describe EmsContainerController do
  let(:myhawkularroute) { double(:spec => double(:host => "myhawkularroute.com")) }

  context "::EmsCommon" do
    context "adding new provider without hawkular endpoint" do
      def test_creating(emstype)
        raise ArgumentError, "Unsupported type [#{emstype}]" unless %w(kubernetes openshift).include?(emstype)
        @ems = ExtManagementSystem.model_from_emstype(emstype).new
        controller.instance_variable_set(:@_params,
                                         :name              => 'NimiCule',
                                         :default_userid    => '_',
                                         :default_hostname  => 'mytest.com',
                                         :default_api_port  => '8443',
                                         :default_password  => 'valid-token',
                                         :emstype           => emstype)
        controller.send(:set_ems_record_vars, @ems)
        expect(@flash_array).to be_nil
      end

      it "doesn't probe routes for kubernetes" do
        test_creating('kubernetes')
        expect(@ems.connection_configurations.hawkular).to eq(nil)
      end

      it "doesn't probe openshift for kubernetes" do
        test_creating('openshift')
        expect(@ems.connection_configurations.hawkular).to eq(nil)
      end
    end

    context "#update" do
      context "updates provider with new token" do
        before :each do
          stub_user(:features => :all)
          session[:edit] = assigns(:edit)
        end

        def test_setting_many_fields
          controller.instance_variable_set(:@_params, :name                      => 'EMS 2',
                                                      :default_userid            => '_',
                                                      :default_hostname          => '10.10.10.11',
                                                      :default_api_port          => '5000',
                                                      :default_security_protocol => 'ssl-with-validation-custom-ca',
                                                      :default_tls_ca_certs      => '-----BEGIN DUMMY...',
                                                      :default_password          => 'valid-token',
                                                      :metrics_selection         => 'hawkular',
                                                      :metrics_hostname          => '10.10.10.10',
                                                      :metrics_api_port          => '8443',
                                                      :metrics_security_protocol => 'ssl-with-validation',
                                                      :emstype                   => @type)
          controller.send(:set_ems_record_vars, @ems)
          expect(@flash_array).to be_nil
          cc = @ems.connection_configurations
          expect(cc.default.endpoint.hostname).to eq('10.10.10.11')
          expect(cc.default.endpoint.port).to eq(5000)
          expect(cc.default.endpoint.security_protocol).to eq('ssl-with-validation-custom-ca')
          expect(cc.default.endpoint.verify_ssl?).to eq(true)
          expect(cc.default.endpoint.certificate_authority).to eq('-----BEGIN DUMMY...')
          expect(cc.hawkular.endpoint.hostname).to eq('10.10.10.10')
          expect(cc.hawkular.endpoint.port).to eq(8443)
          expect(cc.hawkular.endpoint.security_protocol).to eq('ssl-with-validation')
          expect(cc.hawkular.endpoint.verify_ssl?).to eq(true)
          expect(cc.hawkular.endpoint.certificate_authority).to eq(nil)
          expect(@ems.authentication_token("bearer")).to eq('valid-token')
          expect(@ems.authentication_type("default")).to be_nil
          expect(@ems.hostname).to eq('10.10.10.11')
        end

        def test_setting_few_fields
          controller.remove_instance_variable(:@_params)
          controller.instance_variable_set(:@_params, :name => 'EMS 3', :default_userid => '_')
          controller.send(:set_ems_record_vars, @ems)
          expect(@flash_array).to be_nil
          expect(@ems.authentication_token("bearer")).to eq('valid-token')
          expect(@ems.authentication_type("default")).to be_nil
        end

        it "when editing kubernetes EMS" do
          @type = 'kubernetes'
          @ems  = ManageIQ::Providers::Kubernetes::ContainerManager.new
          test_setting_many_fields

          test_setting_few_fields
          expect(@ems.connection_configurations.hawkular.endpoint.hostname).to eq('10.10.10.10')
        end

        it "when editing openshift EMS" do
          @type = 'openshift'
          @ems  = ManageIQ::Providers::Openshift::ContainerManager.new
          test_setting_many_fields

          test_setting_few_fields
          expect(@ems.connection_configurations.hawkular.endpoint.hostname).to eq('10.10.10.10')
        end
      end
    end

    context "#button" do
      before(:each) do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
      end

      it "when VM Migrate is pressed for unsupported type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        vm = FactoryGirl.create(:vm_microsoft)
        post :button, :params => { :pressed => "vm_migrate", :format => :js, "check_#{vm.id}" => "1" }
        expect(controller.send(:flash_errors?)).to be_truthy
        expect(assigns(:flash_array).first[:message]).to include('does not apply')
      end

      let(:ems)     { FactoryGirl.create(:ext_management_system) }
      let(:storage) { FactoryGirl.create(:storage) }

      it "when VM Migrate is pressed for supported type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        vm = FactoryGirl.create(:vm_vmware, :storage => storage, :ext_management_system => ems)
        post :button, :params => { :pressed => "vm_migrate", :format => :js, "check_#{vm.id}" => "1" }
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end

      it "when VM Migrate is pressed for supported type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        vm = FactoryGirl.create(:vm_vmware)
        post :button, :params => { :pressed => "vm_edit", :format => :js, "check_#{vm.id}" => "1" }
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end
    end

    describe "#download_summary_pdf" do
      let(:ems_kubernetes_container) { FactoryGirl.create(:ems_kubernetes, :name => "test") }
      let(:pdf_options) { controller.instance_variable_get(:@options) }

      context "download pdf file" do
        before :each do
          stub_user(:features => :all)
          allow(PdfGenerator).to receive(:pdf_from_string).with('', 'pdf_summary.css').and_return("")
          get :download_summary_pdf, :params => {:id => ems_kubernetes_container.id}
        end

        it "should not contains string 'ManageIQ' in the title of summary report" do
          expect(pdf_options[:title]).not_to include('ManageIQ')
        end

        it "should match proper title of report" do
          expect(pdf_options[:title]).to eq('Container Provider (Kubernetes) "test"')
        end
      end
    end
  end
end

describe EmsInfraController do
  context "#show_link" do
    let(:ems) { double(EmsInfra, :id => 1) }
    it "sets relative url" do
      controller.instance_variable_set(:@table_name, "ems_infra")
      link = controller.send(:show_link, ems, :display => "vms")
      expect(link).to eq("/ems_infra/#{ems.id}?display=vms")
    end
  end
  include_examples '#download_summary_pdf', :ems_openstack_infra
end

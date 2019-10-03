describe EmsCloudController do
  context "::EmsCommon" do
    describe "#new" do
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

    describe "#button" do
      before do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
      end

      it "when Retire Button is pressed for a Cloud provider Instance" do
        allow(controller).to receive(:role_allows?).and_return(true)
        ems = FactoryBot.create(:ems_vmware)
        vm = FactoryBot.create(:vm_vmware,
                               :ext_management_system => ems,
                               :storage               => FactoryBot.create(:storage))
        post :button, :params => { :pressed => "instance_retire", "check_#{vm.id}" => "1", :format => :js, :id => ems.id, :display => 'instances' }
        expect(response.status).to eq 200
        expect(response.body).to include('vm/retire')
      end

      it "when Retire Button is pressed for an Orchestration Stack" do
        allow(controller).to receive(:role_allows?).and_return(true)
        ems = FactoryBot.create(:ems_amazon)
        ost = FactoryBot.create(:orchestration_stack_cloud, :ext_management_system => ems)
        post :button, :params => { :pressed => "orchestration_stack_retire", "check_#{ost.id}" => "1", :format => :js, :id => ems.id, :display => 'orchestration_stacks' }
        expect(response.status).to eq 200
        expect(response.body).to include('orchestration_stack/retire')
      end

      it "when the Tagging Button is pressed for a Cloud provider Instance" do
        allow(controller).to receive(:role_allows?).and_return(true)
        ems = FactoryBot.create(:ems_vmware)
        vm = FactoryBot.create(:vm_vmware,
                               :ext_management_system => ems,
                               :storage               => FactoryBot.create(:storage))
        post :button, :params => { :pressed => "instance_tag", "check_#{vm.id}" => "1", :format => :js, :id => ems.id, :display => 'instances' }
        expect(response.status).to eq 200
        expect(response.body).to include('ems_cloud/tagging_edit')
      end

      it "call tagging_edit when tha Tagging Button is pressed for one or more Cloud provider Image(s)" do
        allow(controller).to receive(:role_allows?).and_return(true)
        ems = FactoryBot.create(:ems_amazon)
        vm = FactoryBot.create(:vm_amazon,
                               :ext_management_system => ems)
        post :button, :params => { :pressed => "image_tag", "check_#{vm.id}" => "1", :format => :js, :id => ems.id, :display => 'images' }
        expect(response.status).to eq 200
        expect(response.body).to include('ems_cloud/tagging_edit')
      end

      it "when Delete Button is pressed for CloudObjectStoreContainer" do
        expect(controller).to receive(:process_cloud_object_storage_buttons)
        post :button, :params => { :pressed => "cloud_object_store_container_delete" }
      end

      context 'actions on Host Aggregates displayed through Cloud Provider' do
        let(:aggregate) { FactoryBot.create(:host_aggregate) }

        before do
          allow(controller).to receive(:performed?).and_return(true)
          controller.params = {:pressed => pressed, :miq_grid_checks => aggregate.id.to_s}
        end

        context 'editing Host Aggregate' do
          let(:pressed) { 'host_aggregate_edit' }

          it 'calls javascript_redirect to redirect to host_aggregate controller' do
            expect(controller).to receive(:javascript_redirect).with(:action => 'edit', :id => [aggregate.id], :controller => 'host_aggregate')
            controller.send(:button)
          end
        end

        context 'adding Host to Host Aggregate' do
          let(:pressed) { 'host_aggregate_add_host' }

          it 'calls javascript_redirect to redirect to host_aggregate controller' do
            expect(controller).to receive(:javascript_redirect).with(:action => 'add_host_select', :id => [aggregate.id], :controller => 'host_aggregate')
            controller.send(:button)
          end
        end

        context 'removing Host from Host Aggregate' do
          let(:pressed) { 'host_aggregate_remove_host' }

          it 'calls javascript_redirect to redirect to host_aggregate controller' do
            expect(controller).to receive(:javascript_redirect).with(:action => 'remove_host_select', :id => [aggregate.id], :controller => 'host_aggregate')
            controller.send(:button)
          end
        end
      end
    end
  end

  describe "#download_summary_pdf" do
    let(:provider_openstack) { FactoryBot.create(:provider_openstack, :name => "Undercloud") }
    let(:ems_openstack) { FactoryBot.create(:ems_openstack, :name => "overcloud", :provider => provider_openstack) }
    let(:pdf_options) { controller.instance_variable_get(:@options) }

    context "download pdf file" do
      before do
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
        raise ArgumentError, "Unsupported type [#{emstype}]" unless %w[kubernetes openshift].include?(emstype)

        @ems = ExtManagementSystem.model_from_emstype(emstype).new
        controller.params = {:name             => 'NimiCule',
                             :default_userid   => '_',
                             :default_hostname => 'mytest.com',
                             :default_api_port => '8443',
                             :default_password => 'valid-token',
                             :emstype          => emstype}
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

    describe "#update" do
      context "updates provider with new token" do
        before do
          stub_user(:features => :all)
          session[:edit] = assigns(:edit)
        end

        def test_setting_many_fields
          controller.params = {:name                      => 'EMS 2',
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
                               :emstype                   => @type}
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
          controller.params = {:name => 'EMS 3', :default_userid => '_'}
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

        it 'updates provider options' do
          @type = 'openshift'
          @ems  = ManageIQ::Providers::Openshift::ContainerManager.new
          controller.params = {:provider_options_image_inspector_options_http_proxy => "example.com"}
          controller.send(:set_ems_record_vars, @ems)
          expect(@ems.options[:image_inspector_options][:http_proxy]).to eq("example.com")
        end
      end
    end

    describe "#button" do
      before do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
      end

      it "when VM Migrate is pressed for unsupported type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        vm = FactoryBot.create(:vm_microsoft)
        post :button, :params => { :pressed => "vm_migrate", :format => :js, "check_#{vm.id}" => "1" }
        expect(controller.send(:flash_errors?)).to be_truthy
        expect(assigns(:flash_array).first[:message]).to include('does not apply')
      end

      let(:ems)     { FactoryBot.create(:ext_management_system) }
      let(:storage) { FactoryBot.create(:storage) }

      it "when VM Migrate is pressed for supported type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        vm = FactoryBot.create(:vm_vmware, :storage => storage, :ext_management_system => ems)
        post :button, :params => { :pressed => "vm_migrate", :format => :js, "check_#{vm.id}" => "1" }
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end

      it "when VM Migrate is pressed for supported type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        vm = FactoryBot.create(:vm_vmware)
        post :button, :params => { :pressed => "vm_edit", :format => :js, "check_#{vm.id}" => "1" }
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end

      context 'displaying nested lists from summary page of container provider' do
        let(:provider) { ManageIQ::Providers::ContainerManager.new }

        before do
          allow(controller).to receive(:javascript_redirect)
          allow(controller).to receive(:performed?).and_return(true)
          controller.instance_variable_set(:@display, display)
          controller.params = {:pressed => press, :miq_grid_checks => item.id.to_s, :id => provider.id}
          controller.instance_variable_set(:@breadcrumbs, [])
        end

        {
          'container_image'      => 'Container Images',
          'container_replicator' => 'Container Replicators',
          'container_node'       => 'Container Nodes',
          'container_group'      => 'Container Pods'
        }.each do |display_s, items|
          context "displaying #{items}" do
            let(:item) { FactoryBot.create(display_s.to_sym) }
            let(:display) { display_s.pluralize }

            context "tagging selected #{items}" do
              let(:press) { "#{display_s}_tag" }

              it 'calls tag method with proper model class' do
                expect(controller).to receive(:tag).with(display_s.classify.safe_constantize)
                controller.send(:button)
              end
            end

            context "managing policies of selected #{items}" do
              let(:press) { "#{display_s}_protect" }

              it 'calls assign_policies method with proper model class' do
                expect(controller).to receive(:assign_policies).with(display_s.classify.safe_constantize)
                controller.send(:button)
              end
            end

            context "checking compliance of selected #{items}" do
              let(:press) { "#{display_s}_check_compliance" }

              it 'calls check_compliance_nested method with proper model class' do
                expect(controller).to receive(:check_compliance_nested).with(display_s.classify.safe_constantize)
                controller.send(:button)
              end
            end
          end
        end
      end
    end

    describe "#download_summary_pdf" do
      let(:ems_kubernetes_container) { FactoryBot.create(:ems_kubernetes, :name => "test") }
      let(:pdf_options) { controller.instance_variable_get(:@options) }

      context "download pdf file" do
        before do
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
  describe "#show_link" do
    let(:ems) { FactoryBot.create(:ems_infra) }
    it "sets relative url" do
      controller.instance_variable_set(:@table_name, "ems_infra")
      link = controller.send(:show_link, ems, :display => "vms")
      expect(link).to eq("/ems_infra/#{ems.id}?display=vms")
    end
  end
  include_examples '#download_summary_pdf', :ems_openstack_infra
end

describe EmsNetworkController do
  context "::EmsCommon" do
    describe "#button" do
      before do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
      end

      it "when edit is pressed for unsupported network manager type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        google_net = FactoryBot.create(:ems_google_network)
        get :edit, :params => { :id => google_net.id}
        expect(response.status).to eq(302)
        expect(session['flash_msgs']).not_to be_empty
        expect(session['flash_msgs'].first[:message]).to include('is not supported')
      end

      it "when edit is pressed for supported network manager type" do
        allow(controller).to receive(:role_allows?).and_return(true)
        nuage_net = FactoryBot.create(:ems_nuage_network)
        get :edit, :params => { :id => nuage_net.id}
        expect(response.status).to eq(200)
        expect(session['flash_msgs']).to be_nil
      end
    end
  end
end

describe EmsCloudController do
  context "::EmsCommon" do
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

      context 'Shelve offload applied on Instances displayed in a nested list' do
        before do
          controller.params = {:pressed => 'instance_shelve_offload'}
          allow(controller).to receive(:performed?).and_return(true)
          allow(controller).to receive(:show)
        end

        it 'calls shelveoffloadvms' do
          expect(controller).to receive(:shelveoffloadvms)
          controller.send(:button)
        end
      end

      context 'deleting Cloud Tenants' do
        let(:ems) { FactoryBot.create(:ems_openstack) }
        let(:tenant) { FactoryBot.create(:cloud_tenant_openstack, :ext_management_system => ems) }

        before do
          allow(controller).to receive(:show)
          controller.params = {:pressed => 'cloud_tenant_delete', :miq_grid_checks => tenant.id.to_s}
        end

        it 'calls javascript_redirect with appropriate arguments to delete selected Cloud Tenants' do
          expect(controller).to receive(:javascript_redirect).with(:controller      => "cloud_tenant",
                                                                   :action          => 'delete_cloud_tenants',
                                                                   :miq_grid_checks => tenant.id.to_s)
          controller.send(:button)
        end
      end

      context 'actions on Host Aggregates displayed through Cloud Provider' do
        let(:aggregate) { FactoryBot.create(:host_aggregate) }

        before do
          allow(controller).to receive(:performed?).and_return(true)
          controller.params = {:pressed => pressed, :miq_grid_checks => aggregate.id.to_s}
          controller.instance_variable_set(:@display, 'host_aggregates')
        end

        context 'setting params[:display] because of a nested list' do
          let(:pressed) { 'host_aggregate_edit' }

          before { allow(controller).to receive(:render) }

          it 'sets params[:display]' do
            controller.send(:button)
            expect(controller.params[:display]).to eq('host_aggregates')
          end
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

        context 'deleting Host Aggregate' do
          let(:pressed) { 'host_aggregate_delete' }

          it 'calls javascript_redirect to redirect to host_aggregate controller' do
            expect(controller).to receive(:javascript_redirect).with(:action => 'delete_host_aggregates', :id => nil, :miq_grid_checks => aggregate.id.to_s, :controller => 'host_aggregate')
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

              it 'returns before calling check_if_button_is_implemented' do
                expect(controller).not_to receive(:check_if_button_is_implemented)
                controller.send(:button)
              end
            end

            context "managing policies of selected #{items}" do
              let(:press) { "#{display_s}_protect" }

              it 'calls assign_policies method with proper model class' do
                expect(controller).to receive(:assign_policies).with(display_s.classify.safe_constantize)
                controller.send(:button)
              end

              it 'returns before calling check_if_button_is_implemented' do
                expect(controller).not_to receive(:check_if_button_is_implemented)
                controller.send(:button)
              end
            end

            context "checking compliance of selected #{items}" do
              let(:press) { "#{display_s}_check_compliance" }

              before do
                allow(controller).to receive(:process_check_compliance)
                controller.instance_variable_set(:@lastaction, 'show')
              end

              it 'calls check_compliance_nested method with proper model class' do
                expect(controller).to receive(:check_compliance_nested).with(display_s.classify.safe_constantize)
                controller.send(:button)
              end

              it 'calls show method' do
                expect(controller).to receive(:show)
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

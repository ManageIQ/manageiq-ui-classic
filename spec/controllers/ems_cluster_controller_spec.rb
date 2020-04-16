describe EmsClusterController do
  context "#button" do
    before { allow(controller).to receive(:performed?) }
    it "when VM Right Size Recommendations is pressed" do
      controller.params = {:pressed => "vm_right_size"}
      expect(controller).to receive(:vm_right_size)
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Migrate button is pressed" do
      controller.params = {:pressed => "vm_migrate"}
      controller.instance_variable_set(:@refresh_partial, "layouts/gtl")
      expect(controller).to receive(:prov_redirect).with("migrate")
      expect(controller).to receive(:render)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Retire button is pressed" do
      controller.params = {:pressed => "vm_retire"}
      expect(controller).to receive(:retirevms).once
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Manage Policies is pressed" do
      controller.params = {:pressed => "vm_protect"}
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Manage Policies is pressed" do
      controller.params = {:pressed => "miq_template_protect"}
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Tag is pressed" do
      controller.params = {:pressed => "vm_tag"}
      expect(controller).to receive(:tag).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Tag is pressed" do
      controller.params = {:pressed => "miq_template_tag"}
      expect(controller).to receive(:tag).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Host Analyze then Check Compliance is pressed" do
      controller.params = {:pressed => "host_analyze_check_compliance"}
      allow(controller).to receive(:show)
      expect(controller).to receive(:analyze_check_compliance_hosts)
      expect(controller).to receive(:render)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    context 'Check Compliance action on VMs of a Cluster' do
      let(:vm) { FactoryBot.create(:vm_vmware) }
      let(:cluster) { FactoryBot.create(:ems_cluster) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:render)
        allow(controller).to receive(:show)
        controller.instance_variable_set(:@display, 'vms')
        controller.params = {:miq_grid_checks => vm.id.to_s, :pressed => 'vm_check_compliance', :id => cluster.id.to_s, :controller => 'ems_cluster'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          EvmSpecHelper.create_guid_miq_server_zone
          vm.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @cluster = FactoryBot.create(:ems_cluster)
      login_as FactoryBot.create(:user, :features => "none")
    end

    context "render listnav partial" do
      render_views

      it "correctly for summary page" do
        get :show, :params => {:id => @cluster.id}

        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/listnav/_ems_cluster")
        expect(response).to render_template('layouts/_textual_groups_generic')
      end

      it "correctly for timeline page" do
        get :show, :params => {:id => @cluster.id, :display => 'timeline'}

        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/listnav/_ems_cluster")
      end
    end
  end

  include_examples '#download_summary_pdf', :ems_cluster

  it_behaves_like "controller with custom buttons"

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:display) { 'display' }
    let(:filters) { 'filters' }
    let(:catinfo) { 'catinfo' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:ems_cluster_lastaction => lastaction,
                                                          :ems_cluster_display    => display,
                                                          :ems_cluster_catinfo    => catinfo,
                                                          :ems_cluster_filters    => filters)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Clusters")
        expect(controller.instance_variable_get(:@layout)).to eq("ems_cluster")
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(display)
        expect(controller.instance_variable_get(:@catinfo)).to eq(catinfo)
        expect(controller.instance_variable_get(:@filters)).to eq(filters)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@display, display)
        controller.instance_variable_set(:@filters, filters)
        controller.instance_variable_set(:@catinfo, catinfo)
        controller.send(:set_session_data)

        expect(controller.session[:ems_cluster_lastaction]).to eq(lastaction)
        expect(controller.session[:ems_cluster_display]).to eq(display)
        expect(controller.session[:ems_cluster_filters]).to eq(filters)
        expect(controller.session[:ems_cluster_catinfo]).to eq(catinfo)
      end
    end
  end
end

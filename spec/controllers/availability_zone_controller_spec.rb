describe AvailabilityZoneController do
  describe "#show" do
    let(:params) { {:id => zone.id} }
    let(:zone) { FactoryBot.create(:availability_zone) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user_admin)
    end

    subject { get :show, :params => params }

    render_views

    it 'renders listnav partial' do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/listnav/_availability_zone")
    end

    context 'display timeline' do
      let(:params) { {:id => zone.id, :display => 'timeline'} }

      it 'renders listnav partial' do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_availability_zone")
      end
    end
  end

  describe '#button' do
    context 'Check Compliance of Last Known Configuration on Instances' do
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }
      let(:av_zone) { FactoryBot.create(:availability_zone) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => av_zone.id.to_s, :controller => 'availability_zone'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          EvmSpecHelper.create_guid_miq_server_zone
          vm_instance.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end

  include_examples '#download_summary_pdf', :availability_zone
end

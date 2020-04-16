describe FlavorController do
  let(:flavor) { FactoryBot.create(:flavor) }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    stub_user(:features => :all)
  end

  describe "#show" do
    subject { get :show, :params => {:id => flavor.id} }

    context "render listnav partial" do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_flavor")
      end
    end

    context "with @search_text set" do
      render_views

      before { controller.instance_variable_set(:@search_text, 'search text') }

      it "doesn't render @search_text in summary screen" do
        get :show, :params => {:id => flavor.id}
        expect(response.body).not_to include('search text')
        expect(controller.instance_variable_get(:@title)).not_to include('search text')
      end
    end
  end

  describe '#button' do
    context 'when "flavor_create" is pressed' do
      it 'redirects to "#new"' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'new')
        post :button, :params => {:pressed => 'flavor_create'}
      end
    end

    context 'when "flavor_delete" is pressed' do
      it 'queues deletion of selected flavors' do
        expect(controller).to receive(:delete_flavors).and_call_original
        expect_any_instance_of(Flavor).to receive(:delete_flavor_queue)
        post :button, :params => {:pressed => 'flavor_delete', :miq_grid_checks => flavor.id}
      end
    end

    context 'when "flavor_tag" is pressed' do
      it 'calls "tag" for "Flavor"' do
        expect(controller).to receive(:tag).with(Flavor)
        post :button, :params => {:pressed => 'flavor_tag'}
      end
    end

    context 'Check Compliance of Last Known Configuration on Instances' do
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => flavor.id.to_s, :controller => 'flavor'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
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

  include_examples '#download_summary_pdf', :flavor
end

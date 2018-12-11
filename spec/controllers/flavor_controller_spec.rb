describe FlavorController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    stub_user(:features => :all)
    @flavor = FactoryBot.create(:flavor)
  end

  describe "#show" do
    subject { get :show, :params => {:id => @flavor.id} }

    context "render listnav partial" do
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_flavor")
      end
    end

    context "with @search_text set" do
      render_views
      it "doesn't render @search_text in summary screen" do
        controller.instance_variable_set(:@search_text, 'search text')
        get :show, :params => {:id => @flavor.id}
        expect(response.body).not_to include('search text')
        expect(controller.instance_variable_get(:@title)).not_to include('search text')
      end
    end
  end

  describe 'button' do
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
        post :button, :params => {:pressed => 'flavor_delete', :miq_grid_checks => @flavor.id}
      end
    end

    context 'when "flavor_tag" is pressed' do
      it 'calls "tag" for "Flavor"' do
        expect(controller).to receive(:tag).with(Flavor)
        post :button, :params => {:pressed => 'flavor_tag'}
      end
    end
  end

  include_examples '#download_summary_pdf', :flavor
end

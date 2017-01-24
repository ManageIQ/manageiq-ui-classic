describe AvailabilityZoneController do
  let(:zone) { FactoryGirl.create(:availability_zone) }
  let(:user) { stub_user(:features => :all) }

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as user
    end

    subject do
      get :show, :params => {:id => zone.id}
    end

    context "render listnav partial" do
      render_views

      it { is_expected.to have_http_status 200 }
      it { is_expected.to render_template(:partial => "layouts/listnav/_availability_zone") }
    end
  end

  include_examples '#download_summary_pdf', :availability_zone

  describe "#button" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as user
    end

    context "when tag button is pressed" do
      let(:pressed) { "availability_zone_tag" }

      subject do
        post :button, :params => { :id => zone.id, :pressed => pressed, :format => :js }
      end

      it { is_expected.to have_http_status 200 }
    end

    context 'when control of sub item is transferred' do
      it 'processes the sub item and returns nothing' do
        expect(controller).to receive(:process_vm_buttons)
        post :button, :params => { :id => zone.id, :pressed => "vm_protect", :format => :js }
        expect(response).to have_http_status 204
      end
    end
  end
end

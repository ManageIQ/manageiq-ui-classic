describe MiqPolicyRsopController do
  before do
    stub_user(:features => :all)
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:layout) { 'miq_policy_rsop' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:miq_policy_rsop_lastaction => lastaction,
                                                          :layout                     => layout)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Simulation")
        expect(controller.instance_variable_get(:@layout)).to eq(layout)
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@layout, layout)
        controller.send(:set_session_data)

        expect(controller.session[:miq_policy_rsop_lastaction]).to eq(lastaction)
        expect(controller.session[:layout]).to eq(layout)
      end
    end
  end

  describe "breadcrumbs" do
    before { EvmSpecHelper.local_miq_server }

    it "shows 'simulation' on rsop screen" do
      post :rsop

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Simulation")
    end
  end
end

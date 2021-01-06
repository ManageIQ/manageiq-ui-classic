describe MiqPolicyLogController do
  before do
    stub_user(:features => :all)
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:server_options) { 'server options' }
    let(:layout) { 'miq_policy_log' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:miq_policy_log_lastaction => lastaction,
                                                          :server_options            => server_options,
                                                          :layout                    => layout)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Log")
        expect(controller.instance_variable_get(:@layout)).to eq(layout)
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
        expect(controller.instance_variable_get(:@server_options)).to eq(server_options)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@layout, layout)
        controller.instance_variable_set(:@server_options, server_options)
        controller.send(:set_session_data)

        expect(controller.session[:miq_policy_log_lastaction]).to eq(lastaction)
        expect(controller.session[:layout]).to eq(layout)
        expect(controller.session[:server_options]).to eq(server_options)
      end
    end
  end

  describe "breadcrumbs" do
    before { EvmSpecHelper.local_miq_server }

    it "shows 'log' on log screen" do
      get :index

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Log")
    end
  end
end

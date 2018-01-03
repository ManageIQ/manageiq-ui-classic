describe ApplicationHelper::Button::MiddlewareStandaloneServerAction do
  let(:mw_server) { FactoryGirl.create(:middleware_server) }
  let(:record) { mw_server }
  subject { described_class.new(setup_view_context_with_sandbox({}), {}, {'record' => record}, {}) }

  describe '#visible?' do
    before do
      allow(mw_server).to receive(:in_domain?) { in_domain }
      allow(mw_server).to receive(:mutable?) { mutable }
    end
    context 'delegated for record' do
      let(:record) { FactoryGirl.create(delegated_class.to_sym, :middleware_server => mw_server) }
      let(:in_domain) { false }
      let(:mutable) { true }

      %w(middleware_deployment).each do |dc|
        context dc.to_s do
          let(:delegated_class) { dc }
          it { is_expected.to be_visible }
        end
      end
    end

    context 'with record' do
      context 'not in domain' do
        let(:in_domain) { false }

        context 'mutable' do
          let(:mutable) { true }
          it { is_expected.to be_visible }
        end

        context 'immutable' do
          let(:mutable) { false }
          it { is_expected.not_to be_visible }
        end
      end

      context 'in domain' do
        let(:in_domain) { true }
        it { is_expected.not_to be_visible }
      end
    end

    context 'record is nil' do
      let(:record) { nil }
      it { is_expected.not_to be_visible }
    end
  end
end

describe ApplicationHelper::Button::NewFlavor do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:lastaction) { '' }
  let(:display) { '' }
  let(:button) { described_class.new(view_context, {}, {'lastaction' => lastaction, 'display' => display}, {}) }

  it_behaves_like 'a _new or _discover button'

  describe '#disabled?' do
    subject { button[:title] }

    context 'no provider available' do
      it_behaves_like 'a disabled button'
    end

    context 'provider available' do
      before do
        provider = FactoryBot.create(:ems_openstack)
        allow(provider.class::Flavor).to receive(:create).and_return(true)
      end

      it_behaves_like 'an enabled button'
    end
  end
end

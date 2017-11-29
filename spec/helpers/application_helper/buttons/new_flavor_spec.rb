describe ApplicationHelper::Button::NewFlavor do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  describe '#disabled?' do
    subject { button[:title] }

    context 'no provider available' do
      before { button.calculate_properties }

      it_behaves_like 'a disabled button'
    end

    context 'provider available' do
      before do
        provider = FactoryGirl.create(:ems_cloud)
        allow(provider.class::Flavor).to receive(:create).and_return(true)
        button.calculate_properties
      end

      it_behaves_like 'an enabled button'
    end
  end
end

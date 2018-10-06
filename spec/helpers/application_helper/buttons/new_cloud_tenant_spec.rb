describe ApplicationHelper::Button::NewCloudTenant do
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
        FactoryGirl.create(:ems_openstack)
        button.calculate_properties
      end

      it_behaves_like 'an enabled button'
    end

    context 'provider available telefonica' do
      before do
        FactoryGirl.create(:ems_telefonica)
        button.calculate_properties
      end

      it_behaves_like 'an enabled button'
    end
  end
end

describe ApplicationHelper::Button::NewHostAggregate do
  let(:user)   { FactoryGirl.create(:user, :miq_groups => [group]) }
  let(:group)  { FactoryGirl.create(:miq_group, :tenant => tenant, :entitlement => entitlement) }
  let(:tenant) { FactoryGirl.create(:tenant) }
  let(:entitlement) { nil }

  let!(:provider) { FactoryGirl.create(:ems_openstack, :tenant => tenant) }

  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button)       { described_class.new(view_context, {}, {}, {}) }

  before do
    EvmSpecHelper.local_miq_server
    allow(User).to receive(:current_user).and_return(user)
  end

  describe '#disabled?' do
    subject { button[:title] }

    context 'no provider available' do
      let(:provider) { nil }
      before { button.calculate_properties }

      it_behaves_like 'a disabled button', 'No cloud provider supports creating host aggregates.'
    end

    context 'provider is not available due to RBAC rules' do
      let(:entitlement) { FactoryGirl.create(:entitlement) }

      before do
        entitlement.set_managed_filters([["/managed/environment/prod"]])
        entitlement.set_belongsto_filters([])
        button.calculate_properties
      end

      it_behaves_like 'a disabled button', 'No cloud provider supports creating host aggregates.'
    end

    context 'a provider is available' do
      before { button.calculate_properties }

      it_behaves_like 'an enabled button'
    end
  end
end

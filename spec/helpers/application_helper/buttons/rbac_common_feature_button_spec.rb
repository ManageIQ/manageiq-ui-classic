describe ApplicationHelper::Button::RbacCommonFeatureButton do
  let(:session) { Hash.new }
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {}, {:options => {:feature => feature}}) }

  before { login_as FactoryGirl.create(:user, :features => 'rbac_tenant_add') }

  describe '#role_allows_feature?' do
    subject { button.role_allows_feature? }
    %w(rbac_tenant_add rbac_project_add).each do |feature|
      context 'when user role allows feature' do
        let(:feature) { feature }
        it { expect(subject).to be_truthy }
      end
    end
    context 'when user role does not allow feature' do
      let(:feature) { 'not_allowed_feature' }
      it { expect(subject).to be_falsey }
    end
  end
end

describe ApplicationHelper::Button::TenantAdd do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:tenant) }
  let(:feature) { 'rbac_project_add' }
  let(:options) { {:feature => feature} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {:options => options}) }

  it_behaves_like 'a generic feature button after initialization'

  describe '#visible?' do
    subject { button.visible? }
    context 'when record is a project' do
      let(:record) { FactoryGirl.create(:tenant_project) }
      it { expect(subject).to be_falsey }
    end
    context 'when record is not a project' do
      it { expect(subject).to be_truthy }
    end
  end
end

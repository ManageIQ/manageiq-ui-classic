require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::TenantAdd do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => feature}} }
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:tenant) }
  let(:feature) { 'rbac_project_add' }

  it_behaves_like 'a generic feature button after initialization'

  describe '#visible?' do
    context 'when record is a project' do
      let(:record) { FactoryGirl.create(:tenant_project) }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'when record is not a project' do
      it { expect(subject.visible?).to be_truthy }
    end
  end
end

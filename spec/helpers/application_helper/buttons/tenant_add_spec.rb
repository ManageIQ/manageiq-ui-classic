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
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when record is not a project' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end

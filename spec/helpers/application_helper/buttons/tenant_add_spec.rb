require 'shared/helpers/application_helper/buttons/generic_feature_button'

describe ApplicationHelper::Button::TenantAdd do
  include_context 'ApplicationHelper::Button::GenericFeatureButton'
  let(:record) { FactoryGirl.create(:tenant) }
  let(:feature) { 'rbac_project_add' }

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

require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeGitRefresh do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_ae_git_domain) }

  before { MiqRegion.seed }

  describe '#visible?' do
    context 'when git not enabled' do
      before do
        allow(record).to receive(:git_enabled?).and_return(false)
        allow(MiqRegion.my_region).to receive(:role_active?).with('git_owner').and_return(true)
      end
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
    context 'when GitBasedDomainImportService not available' do
      before { allow(MiqRegion.my_region).to receive(:role_active?).with('git_owner').and_return(false) }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
    context 'when git enabled and GitBasedDomainImportService available' do
      before { allow(MiqRegion.my_region).to receive(:role_active?).with('git_owner').and_return(true) }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
  end
end

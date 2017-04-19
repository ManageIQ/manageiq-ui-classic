require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::CustomizationTemplateCopy do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { nil }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  describe '#visible?' do
    context 'when root node is active' do
      let(:x_node) { 'root' }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'when system node is active' do
      let(:x_node) { 'xx-xx-system' }
      it { expect(subject.visible?).to be_truthy }
    end
    context 'when record has system' do
      let(:x_node) { 'does-not-matter' }
      let(:record) { FactoryGirl.create(:customization_template_cloud_init, :system => true) }
      it { expect(subject.visible?).to be_truthy }
    end
    context 'when other node is active' do
      let(:x_node) { 'xx-xx-10r3' }
      it { expect(subject.visible?).to be_truthy }
    end
  end
end

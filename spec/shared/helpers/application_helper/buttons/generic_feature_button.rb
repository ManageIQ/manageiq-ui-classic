require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::GenericFeatureButton' do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => feature}} }

  describe '#initialize' do
    it 'has a feature' do
      expect(subject.instance_variable_get('@feature')).to eq(feature)
    end
  end
end

shared_context 'ApplicationHelper::Button::GenericFeatureButton#visible?' do
  before { allow(record).to receive("supports_#{feature}?".to_sym).and_return(supports_feature) }

  context "when record supports #{feature}" do
    let(:supports_feature) { true }
    it 'is visible' do
      expect(subject.visible?).to be_truthy
    end
  end
  context "when record does not support #{feature}" do
    let(:supports_feature) { false }
    it 'is not visible' do
      expect(subject.visible?).to be_falsey
    end
  end
end

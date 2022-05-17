shared_examples_for 'a generic feature button' do
  include_examples 'a generic feature button after initialization'

  describe '#visible?' do
    subject { button.visible? }
    before do
      allow(record).to receive("respond_to?").with("supports_#{feature}?").and_return(true)
      # HACK: to mock Array.wrap method for Double
      allow(record).to receive("respond_to?").with(:to_ary).and_return(false)
      allow(record).to receive("supports?").with(feature.to_sym).and_return(supports_feature)
    end

    context "when record supports #{feature}" do
      let(:supports_feature) { true }
      it { expect(subject).to be_truthy }
    end
    context "when record does not support #{feature}" do
      let(:supports_feature) { false }
      it { expect(subject).to be_falsey }
    end
  end
end

shared_examples_for 'a generic feature button after initialization' do
  describe '#initialize' do
    subject { button.instance_variable_get('@feature') }
    it { expect(subject).to eq(feature) }
  end
end

shared_examples_for 'a generic feature button with disabled' do
  include_examples 'a generic feature button'
  include_examples 'GenericFeatureButtonWithDisabled#calculate_properties'
end

shared_examples_for 'GenericFeatureButtonWithDisabled#calculate_properties' do
  describe '#calculate_properties' do
    before do
      allow(record).to receive("supports?").with(feature.to_sym).and_return(support)
      allow(record).to receive(:unsupported_reason).with(feature).and_return("Feature not available/supported") if !support
      button.calculate_properties
    end

    context 'when feature is supported' do
      let(:support) { true }
      it_behaves_like 'an enabled button'
    end
    context 'when feature is not supported' do
      let(:support) { false }
      it_behaves_like 'a disabled button', 'Feature not available/supported'
    end
  end
end

shared_examples_for 'a generic feature button' do
  include_examples 'a generic feature button after initialization'

  describe '#visible?' do
    subject { button.visible? }
    before { allow(record).to receive("supports_#{feature}?".to_sym).and_return(supports_feature) }

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

shared_examples_for 'a feature button' do
  include_examples 'a generic feature button after initialization'

  describe '#visible?' do
    subject { button.visible? }
    context "when record supports #{feature}" do
      before { stub_supports(record, feature) }
      it { expect(subject).to be_truthy }
    end
    context "when record does not support #{feature}" do
      before { stub_supports_not(record, feature, "Feature not available/supported") }
      it { expect(subject).to be_falsey }
    end
  end
end

shared_examples_for 'a generic feature button after initialization' do
  describe '#initialize' do
    subject { button.instance_variable_get(:@feature) }
    it { expect(subject).to eq(feature) }
  end
end

shared_examples_for 'a feature button with disabled' do
  include_examples 'a generic feature button after initialization'

  # always visible  (not sure if we need to test)
  describe '#visible?' do
    subject { button.visible? }
    context "when record supports #{feature}" do
      before { stub_supports(record, feature) }
      it { expect(subject).to be_truthy }
    end
    context "when record does not support #{feature}" do
      before { stub_supports_not(record, feature, "Feature not available/supported") }
      it { expect(subject).to be_truthy }
    end
  end

  describe '#disabled?' do
    context "when records support #{feature}" do
      before { stub_supports(record, feature) }
      it_behaves_like 'an enabled button'
    end
    context "when records do not support #{feature}" do
      before { stub_supports_not(record, feature, "Feature not available/supported") }
      it_behaves_like 'a disabled button', 'Feature not available/supported'
    end
  end
end

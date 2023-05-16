shared_examples_for 'a _new or _discover button' do
  describe '#visible?' do
    subject { button.visible? }
    context 'when button present on a sublist view screen of a CI' do
      let(:lastaction) { 'show' }
      %w[main vms instances all_vms].each do |display|
        context "and display == #{display}" do
          let(:display) { display }
          it { expect(subject).to be_truthy }
        end
        context 'and display is sublist-like' do
          it { expect(subject).to be_falsey }
        end
      end
    end
  end
end

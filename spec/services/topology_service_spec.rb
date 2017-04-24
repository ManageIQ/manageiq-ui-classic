describe TopologyService do
  let(:provider_class) { double }
  before do
    described_class.instance_variable_set(:@provider_class, provider_class)
    allow(provider_class).to receive(:all)
  end

  describe '#initialize' do
    let(:provider_id) { nil }
    subject { described_class.new(provider_id) }

    it 'retrieves all providers' do
      expect(provider_class).to receive(:all).and_return(:yolo)
      expect(subject.instance_variable_get(:@providers)).to eq(:yolo)
    end

    context 'provider ID is set' do
      let(:provider_id) { 3 }

      it 'retrieves the given provider' do
        expect(provider_class).to receive(:where).with(:id => provider_id).and_return(:swag)
        expect(subject.instance_variable_get(:@providers)).to eq(:swag)
      end
    end
  end

  describe '#build_link' do
    let(:source) { '95e49048-3e00-11e5-a0d2-18037327aaeb' }
    let(:target) { '96c35f65-3e00-11e5-a0d2-18037327aaeb' }

    it 'creates link between source and target' do
      expect(subject.build_link(source, target)).to eq(:source => source, :target => target)
    end
  end
end

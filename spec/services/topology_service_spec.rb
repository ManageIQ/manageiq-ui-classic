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

  describe '#build_kinds' do
    let(:kinds) { %i(Host Vm) }
    it 'returns with hash where the keys are kinds' do
      described_class.instance_variable_set(:@kinds, kinds)

      expect(subject.build_kinds.keys).to eq(kinds)
    end
  end

  describe '#entity_id' do
    let(:host) { FactoryBot.create(:host) }

    it 'output begins with class name' do
      expect(subject.entity_id(host)).to start_with(host.class.to_s)
    end

    it 'output ends with id' do
      expect(subject.entity_id(host)).to end_with(host.id.to_s)
    end
  end

  describe '#build_topology' do
    let(:providers) { subject.instance_variable_set(:@providers, []) }

    it 'output is rendered in the expected format' do
      allow(providers).to receive(:includes).and_return([])
      described_class.instance_variable_set(:@kinds, [])

      topology = subject.build_topology

      expect(topology).to have_key(:items)
      expect(topology).to have_key(:relations)
      expect(topology).to have_key(:kinds)
      expect(topology).to have_key(:icons)
      expect(topology).to have_key(:filter_properties)
    end
  end

  describe '#map_to_graph' do
    let(:provider) { FactoryBot.create(:ems_vmware) }
    let(:tag) { FactoryBot.create(:tag) }
    let(:vm) { FactoryBot.create(:vm, :ext_management_system => provider, :tags => [tag]) }
    let(:graph) { {:vms => {:tags => nil}} }

    before do
      allow(subject).to receive(:build_entity_data) { |input| input }
    end

    it 'calls the graph items as methods recursively' do
      expect(provider).to receive(:vms).and_return([vm])
      expect(vm).to receive(:tags).and_return([tag])
      subject.map_to_graph([provider], graph)
    end

    it 'returns with the list of objects and the links between' do
      allow(provider).to receive(:vms).and_return([vm])
      allow(vm).to receive(:tags).and_return([tag])
      output = subject.map_to_graph([provider], graph)

      expect(output.first.values).to eq([provider, vm, tag])
      expect(output.last.length).to eq(2)
    end
  end

  describe '#build_entity_relationships' do
    let(:output) { subject.build_entity_relationships(input) }

    context 'input is a symbol' do
      let(:input) { :sym }
      it 'returns with Input => nil' do
        expect(output).to have_key(input.capitalize)
        expect(output[input.capitalize]).to be_nil
      end
    end

    context 'input is an array of symbols' do
      let(:input) { %i(s1 s2) }

      it 'array values are matching capitalized hash keys with nil as values' do
        expect(output.keys).to eq(input.map(&:capitalize))
        expect(output.values.compact).to eq([])
      end
    end

    context 'input is a hash with symbols' do
      let(:input) { {:s1 => :v1, :s2 => :v2} }

      it 'returns with hash with capitalized keys from input' do
        expect(output.keys).to eq(input.keys.map(&:capitalize))
      end

      it 'recursively calls itself on the input hash values' do
        expect(output.values.reduce({}, :merge).keys).to eq(input.values.map(&:capitalize))
      end
    end
  end

  describe '#entity_name' do
    let(:name) { subject.send(:entity_name, entity) }

    context 'entity is not a tag' do
      let(:entity) { FactoryBot.create(:vm_vmware) }

      it 'returns with the name of the entity' do
        expect(name).to eq(entity.name)
      end
    end

    context 'entity is a tag' do
      let(:parent_cls) { FactoryBot.create(:classification, :description => 'foo') }
      let(:cls) { FactoryBot.create(:classification_tag, :parent => parent_cls, :description => 'bar') }
      let(:entity) { cls.tag }

      it 'returns with the parent and the child classification description' do
        expect(name).to eq('foo: bar')
      end
    end
  end
end

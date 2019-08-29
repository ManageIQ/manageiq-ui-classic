describe TreeNode do
  # Force load all the TreeNode:: subclasses
  Dir[ManageIQ::UI::Classic::Engine.root.join('app', 'presenters', 'tree_node', '*.rb')].each { |f| require f }

  # FIXME: rewrite this to FactoryBot
  let(:object) do
    # We need a Zone & Server for creating a MiqSchedule
    EvmSpecHelper.create_guid_miq_server_zone if klass == MiqSchedule
    klass.new
  end
  let(:parent_id) { dup }
  let(:tree) { double }
  subject { TreeNode.new(object, parent_id, tree) }

  describe '.new' do
    shared_examples 'instance variables' do
      it 'sets instance variables' do
        expect(subject.instance_variable_get(:@object)).to eq(object)
        expect(subject.instance_variable_get(:@parent_id)).to eq(parent_id)
        expect(subject.instance_variable_get(:@tree)).to eq(tree)
      end
    end

    TreeNode.constants.each do |type|
      # We never instantiate MiqAeNode and Node in our codebase
      next if %i[MiqAeNode Node Menu Root REXML].include?(type)

      describe(type) do
        let(:klass) { type.to_s.constantize }

        it 'initializes a new instance' do
          expect(subject).to be_a("TreeNode::#{klass}".constantize)
        end

        include_examples 'instance variables'

        # Skip tests for descendants of Hash
        next if type == :Hash

        type.to_s.constantize.descendants.each do |subtype|
          # Skip the subtypes that have been already tested above
          next if TreeNode.constants.include?(subtype.to_s.to_sym)

          describe(subtype) do
            let(:klass) { subtype }

            it 'initializes a new instance' do
              expect(subject).to be_a("TreeNode::#{klass.base_class}".constantize)
            end

            include_examples 'instance variables'
          end
        end
      end
    end
  end

  describe '.exists?' do
    subject { described_class.exists?(object) }

    context 'object has a direct subclass' do
      let(:object) { User.new }
      it { is_expected.to be_truthy }
    end

    context 'object has an indirect subclass' do
      let(:object) { VmOrTemplate.new }
      it { is_expected.to be_truthy }
    end

    context 'object is a hash' do
      let(:object) { {} }
      it { is_expected.to be_truthy }
    end

    context 'object is an array' do
      let(:object) { [] }
      it { is_expected.to be_falsey }
    end

    context 'object is nil' do
      let(:object) { nil }
      it { is_expected.to be_falsey }
    end
  end
end

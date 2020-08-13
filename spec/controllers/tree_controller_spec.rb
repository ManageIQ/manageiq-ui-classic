describe TreeController do
  before { stub_user(:features => :all) }

  shared_examples 'valid HTTP JSON response' do |endpoint|
    context 'whole tree requested' do
      it 'returns with a valid HTTP JSON response' do
        get endpoint

        expect(response.status).to eq(200)
        expect(response.content_type).to eq('application/json')
      end
    end

    context 'part a tree requested' do
      let(:node_id) { TreeNode.new(record).key }

      it 'returns with a valid HTTP JSON response' do
        get endpoint, :params => {:id => node_id}

        expect(response.status).to eq(200)
        expect(response.content_type).to eq('application/json')
      end
    end
  end

  describe '#automate_entrypoint' do
    let(:record) { FactoryBot.create(:miq_ae_namespace) }

    include_examples 'valid HTTP JSON response', :automate_entrypoint
  end

  describe '#automate_inline_methods' do
    let(:record) { FactoryBot.create(:miq_ae_namespace) }

    include_examples 'valid HTTP JSON response', :automate_inline_methods
  end

  describe '#fetch_tree' do
    let(:klass) { dup }
    let(:tree) { dup }
    let(:node_id) { nil }

    before { tree.instance_variable_set(:@bs_tree, :foo => :bar) }

    subject { controller.send(:fetch_tree, klass, :foo_tree, node_id) }

    it 'returns with a tree hash' do
      expect(klass).to receive(:new).with(:foo_tree, {}, false).and_return(tree)
      expect(tree).to receive(:reload!)
      expect(subject).to eq(:foo => :bar)
    end
  end

  describe 'open_nodes_hierarchy' do
    let(:ns1) { FactoryBot.create(:miq_ae_namespace) }
    let(:cl1) { FactoryBot.create(:miq_ae_class, :ae_namespace => ns1) }
    let(:in1) { FactoryBot.create(:miq_ae_instance, :ae_class => cl1) }

    let(:ns2) { FactoryBot.create(:miq_ae_namespace, :parent => ns1) }
    let(:cl2) { FactoryBot.create(:miq_ae_class, :ae_namespace => ns2) }
    let(:in2) { FactoryBot.create(:miq_ae_instance, :ae_class => cl2) }

    let(:ns3) { FactoryBot.create(:miq_ae_namespace, :parent => ns2) }
    let(:cl3) { FactoryBot.create(:miq_ae_class, :ae_namespace => ns3) }
    let(:in3) { FactoryBot.create(:miq_ae_instance, :ae_class => cl3) }

    it "opens the node by fqn with 1 level tree" do
      # these come in as params
      id = TreeNode.new(in1).key
      fqname = in1.fqname

      fetch_tree(TreeBuilderAutomateEntrypoint, :automate_entrypoint_tree, id) do |tree|
        expect(open_nodes_hierarchy(tree, fqname)).not_to be_nil
      end
    end

    it "opens the node by relative_path with 1 level tree" do
      # these come in as params
      id = TreeNode.new(in1).key
      relative_path = in1.relative_path

      fetch_tree(TreeBuilderAutomateEntrypoint, :automate_entrypoint_tree, id) do |tree|
        expect(open_nodes_hierarchy(tree, relative_path)).not_to be_nil
      end
    end

    it "opens the node by fqn with 2 level tree" do
      # these come in as params
      id = TreeNode.new(in2).key
      fqname = in2.fqname

      fetch_tree(TreeBuilderAutomateEntrypoint, :automate_entrypoint_tree, id) do |tree|
        expect(open_nodes_hierarchy(tree, fqname)).not_to be_nil
      end
    end

    it "opens the node by relative_path with 1 level tree" do
      # these come in as params
      id = TreeNode.new(in2).key
      relative_path = in2.relative_path

      fetch_tree(TreeBuilderAutomateEntrypoint, :automate_entrypoint_tree, id) do |tree|
        expect(open_nodes_hierarchy(tree, relative_path)).not_to be_nil
      end
    end
  end

  def fetch_tree(*args, &block)
    controller.send(:fetch_tree, *args, &block)
  end

  def open_nodes_hierarchy(tree, fqname)
    controller.send(:open_nodes_hierarchy, tree, fqname)
  end
end

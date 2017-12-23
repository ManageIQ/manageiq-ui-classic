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
    let(:record) { FactoryGirl.create(:miq_ae_namespace) }

    include_examples 'valid HTTP JSON response', :automate_entrypoint
  end

  describe '#automate_inline_methods' do
    let(:record) { FactoryGirl.create(:miq_ae_namespace) }

    include_examples 'valid HTTP JSON response', :automate_inline_methods
  end

  describe '#fetch_tree' do
    let(:klass) { dup }
    let(:tree) { dup }
    let(:node_id) { nil }

    before { tree.instance_variable_set(:@bs_tree, :foo => :bar) }

    subject { controller.send(:fetch_tree, klass, :foo, node_id) }

    it 'returns with a tree hash' do
      expect(klass).to receive(:new).with(:foo, :foo_tree, {}).and_return(tree)
      expect(subject).to eq(:foo => :bar)
    end
  end
end

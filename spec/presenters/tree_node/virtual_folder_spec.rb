describe TreeNode::VirtualFolder do
  # This ID has to be unique to not break other tests as we delete it
  let(:folder_id) { "foo#{rand(512)}" }
  after { VirtualFolder.delete(folder_id) }

  subject { described_class.new(object, nil, nil) }
  let(:object) { VirtualFolder.new(folder_id, "bar") }

  include_examples 'TreeNode::Node#key prefix', 'vf-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'
  include_examples 'TreeNode::Node#tooltip same as #text'

  describe '#text' do
    it 'returns the same as object title' do
      expect(subject.tooltip).to eq(object.title)
    end
  end
end

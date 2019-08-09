describe TreeNode::CustomButtonSet do
  let(:tree) { TreeBuilderCatalogItems.new(:sandt_tree, {}, false) }
  subject { described_class.new(object, nil, tree) }
  let(:object) { FactoryBot.create(:custom_button_set, :description => "custom button set description") }

  include_examples 'TreeNode::Node#key prefix', 'cbg-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'

  describe "#tooltip" do
    it "returns the prefixed title" do
      expect(subject.tooltip).to eq("Button Group: custom button set description")
    end
  end

  describe '#text' do
    context 'service catalogs tree' do
      let(:options) { {:tree => :sandt_tree} }

      it 'appends a (Group) suffix' do
        expect(subject.text).to end_with('(Group)')
      end
    end
  end
end

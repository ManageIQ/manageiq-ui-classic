describe TreeNode::MiqEventDefinition do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_event_definition) }

  include_examples 'TreeNode::Node#key prefix', 'ev-'
  include_examples 'TreeNode::Node#icon', 'fa fa-star'
  include_examples 'TreeNode::Node#text description'
end

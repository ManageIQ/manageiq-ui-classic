require 'shared/presenters/tree_node/common'

describe TreeNode::MiqAeInstance do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:miq_ae_instance) }

  include_examples 'TreeNode::Node#key prefix', 'aei-'
  include_examples 'TreeNode::Node#icon', 'product product-ae_instance'
  include_examples 'TreeNode::Node#tooltip prefix', 'Automate Instance'
end

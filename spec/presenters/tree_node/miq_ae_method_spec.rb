require 'shared/presenters/tree_node/common'

describe TreeNode::MiqAeMethod do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:miq_ae_method, :scope => :class, :language => :ruby, :location => :inline) }

  include_examples 'TreeNode::Node#key prefix', 'aem-'
  include_examples 'TreeNode::Node#icon', 'product product-method'
  include_examples 'TreeNode::Node#tooltip prefix', 'Automate Method'
end

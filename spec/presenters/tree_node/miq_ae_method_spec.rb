describe TreeNode::MiqAeMethod do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_ae_method, :scope => :class, :language => :ruby, :location => :inline) }

  include_examples 'TreeNode::Node#key prefix', 'aem-'
  include_examples 'TreeNode::Node#icon', 'fa-ruby'
  include_examples 'TreeNode::Node#tooltip prefix', 'Automate Method'
end

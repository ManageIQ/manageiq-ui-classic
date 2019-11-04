describe TreeNode::Container do
  subject { described_class.new(object, nil, nil) }

  %i(container kubernetes_container).each do |factory|
    context(factory.to_s) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'cnt-'
      include_examples 'TreeNode::Node#icon', 'fa fa-cube'
    end
  end
end

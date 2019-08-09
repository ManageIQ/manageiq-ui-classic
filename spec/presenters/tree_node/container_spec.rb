describe TreeNode::Container do
  subject { described_class.new(object, nil, nil) }

  %i(container kubernetes_container).each do |factory|
    klass = FactoryBot.factory_by_name(factory).instance_variable_get(:@class_name)
    context(klass) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'cnt-'
      include_examples 'TreeNode::Node#icon', 'fa fa-cube'
    end
  end
end

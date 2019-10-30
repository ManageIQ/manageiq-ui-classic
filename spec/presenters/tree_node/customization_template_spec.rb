describe TreeNode::CustomizationTemplate do
  subject { described_class.new(object, nil, nil) }

  %i(
    customization_template
    customization_template_kickstart
    customization_template_sysprep
    customization_template_cloud_init
  ).each do |factory|
    context(factory.to_s) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'ct-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-template'
    end
  end
end

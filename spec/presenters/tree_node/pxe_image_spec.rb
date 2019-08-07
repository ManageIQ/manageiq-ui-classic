describe TreeNode::PxeImage do
  subject { described_class.new(object, nil, nil) }

  %i(
    pxe_image
    pxe_image_ipxe
    pxe_image_pxelinux
  ).each do |factory|
    klass = FactoryBot.factory_by_name(factory).instance_variable_get(:@class_name)
    context(klass) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'pi-'
      include_examples 'TreeNode::Node#icon', 'ff ff-network-card'
    end
  end
end

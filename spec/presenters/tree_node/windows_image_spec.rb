describe TreeNode::WindowsImage do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:windows_image) }

  include_examples 'TreeNode::Node#key prefix', 'wi-'
  include_examples 'TreeNode::Node#image', 'svg/os-windows_generic.svg'
end

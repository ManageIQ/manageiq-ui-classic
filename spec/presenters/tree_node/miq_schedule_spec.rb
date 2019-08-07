describe TreeNode::MiqSchedule do
  subject { described_class.new(object, nil, nil) }
  let(:object) do
    EvmSpecHelper.local_miq_server
    FactoryBot.create(:miq_schedule)
  end

  include_examples 'TreeNode::Node#key prefix', 'msc-'
  include_examples 'TreeNode::Node#icon', 'fa fa-clock-o'
end

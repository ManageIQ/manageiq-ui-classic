describe TreeNode::OrchestrationTemplate do
  subject { described_class.new(object, nil, nil) }

  {
    :orchestration_template_amazon              => %w(ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate cfn),
    :orchestration_template_openstack_in_yaml   => %w(ManageIQ::Providers::Openstack::CloudManager::OrchestrationTemplate hot),
    :orchestration_template_azure_in_json       => %w(ManageIQ::Providers::Azure::CloudManager::OrchestrationTemplate azure),
    :vnfd_template_openstack_in_yaml            => %w(ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate vnfd),
    :orchestration_template_vmware_cloud_in_xml => %w(ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate vapp)
  }.each do |factory, config|
    context(config.first) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'ot-'
      include_examples 'TreeNode::Node#icon', "pficon pficon-template"
    end
  end
end

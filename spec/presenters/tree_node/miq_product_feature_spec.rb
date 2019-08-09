describe TreeNode::MiqProductFeature do
  subject { described_class.new(object, nil, nil) }
  let(:tenant) { FactoryBot.create(:tenant) }

  let(:feature_type) { "tenant" }

  let(:object) { FactoryGirl.build(:miq_product_feature, :tenant => tenant, :identifier => "dialog_edit_editor_tenant_#{tenant.id}", :feature_type => feature_type) }

  context "feature type is view" do
    let(:feature_type) { "view" }

    include_examples 'TreeNode::Node#icon', 'fa fa-search'
  end

  context "feature type is control" do
    let(:feature_type) { "control" }

    include_examples 'TreeNode::Node#icon', 'fa fa-shield'
  end

  context "feature type is admin" do
    let(:feature_type) { "admin" }

    include_examples 'TreeNode::Node#icon', 'pficon pficon-edit'
  end
end

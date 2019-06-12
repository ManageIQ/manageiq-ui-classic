describe ApplicationHelper::Button::Basic do
  context "Button Manage Tenant Quota in OpsController" do
    let(:controller) { OpsController.new }

    let(:button) { ApplicationHelper::Button::Basic.new(controller, nil, {}, {:id => 'rbac_tenant_manage_quotas'}) }
    let(:tenant_alpha) { FactoryBot.create(:tenant, :parent => Tenant.root_tenant) }
    let(:tenant_omega) { FactoryBot.create(:tenant, :parent => tenant_alpha) }

    let(:feature) { MiqProductFeature.find_all_by_identifier(["rbac_tenant_manage_quotas_tenant_#{tenant_omega.id}"]) }
    let(:role_with_access_to_omega_rbac_tenant_manage_quota_permission) { FactoryBot.create(:miq_user_role, :miq_product_features => feature) }

    let(:group_alpha) { FactoryBot.create(:miq_group, :tenant => tenant_alpha, :miq_user_role => role_with_access_to_omega_rbac_tenant_manage_quota_permission) }
    let(:user_alpha)  { FactoryBot.create(:user, :miq_groups => [group_alpha]) }

    before do
      EvmSpecHelper.seed_specific_product_features(%w(rbac_tenant_manage_quotas))
      Tenant.seed

      @view_context = setup_view_context_with_sandbox({})
      User.current_user = user_alpha
      @button_on_tenant_alpha = described_class.new(@view_context, {}, {'record' => tenant_alpha}, {})
      @button_on_tenant_omega = described_class.new(@view_context, {}, {'record' => tenant_omega}, {})
    end

    it "doesn't displays button Manage Tenant Quota for alpha tenant without tenant product permission for alpha tenant" do
      controller.params = {:id => "tn-#{tenant_alpha.id}"}

      expect(button.role_allows_feature?).to be_falsey
    end

    it "displays button Manage Tenant Quota from a tenant omega with tenant product permission for omega tenant" do
      controller.params = {:id => "tn-#{tenant_omega.id}"}

      expect(button.role_allows_feature?).to be_truthy
    end
  end
end

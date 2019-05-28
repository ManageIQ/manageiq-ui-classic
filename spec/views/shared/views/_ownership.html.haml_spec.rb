describe "shared/views/_ownership" do
  let(:user)         { FactoryBot.create(:user, :userid => 'user', :miq_groups => [tenant_group]) }
  let(:tenant)       { FactoryBot.build(:tenant, :parent => Tenant.default_tenant) }
  let(:tenant_users) { FactoryBot.create(:miq_user_role, :name => "tenant-users") }
  let(:tenant_group) { FactoryBot.create(:miq_group, :miq_user_role => tenant_users, :tenant => tenant) }
  let(:user_role)    { FactoryBot.create(:miq_user_role) }
  let(:user_group)   { FactoryBot.create(:miq_group, :miq_user_role => user_role) }

  before do
    set_controller_for_view("vm_infra")
    set_controller_for_view_to_be_nonrestful
  end

  it "the ownership group dropdown includes the no group option" do
    vm = FactoryBot.create(:vm_vmware, :miq_group => tenant_group)
    allow(view).to receive(:ownership_user_options).and_return([user.id])
    allow(view).to receive(:settings).and_return('list')
    allow(view).to receive(:render_gtl_outer)
    @groups = [tenant_group.id, user_group.id]
    @origin_ownership_items = @ownershipitems = Vm.where(:id => vm.id)
    @group = vm.miq_group
    render
    expect(rendered).to include('No User Group')
  end
end

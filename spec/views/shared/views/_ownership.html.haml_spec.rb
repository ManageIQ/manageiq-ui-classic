describe "shared/views/_ownership" do
  let(:root_tenant) do
    Tenant.seed
  end

  let(:default_tenant) do
    root_tenant
    Tenant.default_tenant
  end
  let(:user)         { FactoryGirl.create(:user, :userid => 'user', :miq_groups => [tenant_group]) }
  let(:tenant)       { FactoryGirl.build(:tenant, :parent => default_tenant) }
  let(:tenant_users) { FactoryGirl.create(:miq_user_role, :name => "tenant-users") }
  let(:tenant_group) { FactoryGirl.create(:miq_group, :miq_user_role => tenant_users, :tenant => tenant) }
  let(:user_role)    { FactoryGirl.create(:miq_user_role) }
  let(:user_group)   { FactoryGirl.create(:miq_group, :miq_user_role => user_role) }

  before do
    set_controller_for_view("vm_infra")
    set_controller_for_view_to_be_nonrestful
  end

  it "the ownership group dropdown includes the no group option" do
    vm = FactoryGirl.create(:vm_vmware, :miq_group => tenant_group)
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

describe 'ops/_rbac_tenant_details.html.haml' do
  let(:user) { FactoryBot.create(:user_admin) }
  let(:tenant) { FactoryBot.create(:tenant) }

  before do
    allow(view).to receive(:textual_group_list).and_return([%i[properties], %i[relationships smart_management]])
    allow(User).to receive(:server_timezone).and_return("UTC")
    assign(:record, tenant)
    login_as user
  end

  it 'renders textual summary of a Tenant' do
    render :partial => 'ops/rbac_tenant_details.html.haml'
    expect(rendered).to include("<div id='textual_summary'>", 'Properties', 'Relationships', 'Smart Management')
    expect(rendered).to include(tenant.description)
  end
end

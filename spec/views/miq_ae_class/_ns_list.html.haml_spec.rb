describe "miq_ae_class/_ns_list.html.haml" do
  include Spec::Support::AutomationHelper

  context 'render' do
    def setup_namespace_form(dom)
      assign(:in_a_form, true)
      assign(:ae_ns, dom)
      assign(:edit, :new => {:ns_name => dom.name, :ns_description => "test"})
    end

    context 'displaying Tenant name for each Domain in the list view' do
      let(:tenant) { FactoryBot.create(:tenant) }
      let(:domain) { FactoryBot.create(:miq_ae_domain) }

      before do
        assign(:grid_data, [domain])
        allow(domain).to receive(:tenant).and_return(tenant)
        allow(domain).to receive(:editable?)
        login_as user
      end

      context 'non admin user' do
        let(:user) { FactoryBot.create(:user) }

        it 'does not render Tenant name' do
          render
          expect(rendered).not_to include(domain.tenant.name)
        end
      end

      context 'admin user' do
        let(:user) { FactoryBot.create(:user_admin, :userid => 'admin') }

        it 'renders Tenant name' do
          render
          expect(rendered).to include(domain.tenant.name)
        end
      end
    end
  end
end

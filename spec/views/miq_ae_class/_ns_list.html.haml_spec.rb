describe "miq_ae_class/_ns_list.html.haml" do
  include Spec::Support::AutomationHelper

  context 'render' do
    def setup_namespace_form(dom)
      assign(:in_a_form, true)
      assign(:ae_ns, dom)
      assign(:edit, :new => {:ns_name => dom.name, :ns_description => "test"})
    end

    describe "Git domain" do
      before do
        dom = FactoryBot.create(:miq_ae_git_domain)
        setup_namespace_form(dom)
      end

      it "with name_readonly and description_readonly set to true", :js => true do
        render
        expect(response).to have_css("namespace-form[name_readonly='true']")
        expect(response).to have_css("namespace-form[description_readonly='true']")
      end

      it "with ae_ns_domain set to true", :js => true do
        render
        expect(response).to have_css("namespace-form[ae_ns_domain='true']")
      end

      it "with empty namespace_path", :js => true do
        render
        expect(response).to have_css("namespace-form[namespace_path='']")
      end
    end

    describe "User domain" do
      before do
        dom = FactoryBot.create(:miq_ae_domain)
        setup_namespace_form(dom)
      end

      it "with name_readonly and description_readonly set to false", :js => true do
        render
        expect(response).to have_css("namespace-form[name_readonly='false']")
        expect(response).to have_css("namespace-form[description_readonly='false']")
      end

      it "with ae_ns_domain set to true", :js => true do
        render
        expect(response).to have_css("namespace-form[ae_ns_domain='true']")
      end

      it "with empty namespace_path", :js => true do
        render
        expect(response).to have_css("namespace-form[namespace_path='']")
      end
    end

    describe "Namespace" do
      before do
        dom = FactoryBot.create(:miq_ae_namespace, :parent => FactoryBot.create(:miq_ae_domain))
        assign(:sb, :namespace_path => 'namespace/path')
        setup_namespace_form(dom)
      end

      it "with name_readonly and description_readonly set to false", :js => true do
        render
        expect(response).to have_css("namespace-form[name_readonly='false']")
        expect(response).to have_css("namespace-form[description_readonly='false']")
      end

      it "with ae_ns_domain set to true", :js => true do
        render
        expect(response).to have_css("namespace-form[ae_ns_domain='false']")
      end

      it "Check Git enabled domain", :js => true do
        render
        expect(response).to have_css("namespace-form[namespace_path='namespace/path']")
      end
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
        let(:user) { User.find_by(:userid => 'admin') }

        it 'renders Tenant name' do
          render
          expect(rendered).to include(domain.tenant.name)
        end
      end
    end
  end
end

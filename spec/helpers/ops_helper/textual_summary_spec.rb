describe OpsHelper::TextualSummary do
  let(:record) { '' }

  before { instance_variable_set(:@record, record) }

  include_examples "textual_group", "Properties", %i(
    vmdb_connection_name
    vmdb_connection_ipaddress
    vmdb_connection_vendor
    vmdb_connection_version
    vmdb_connection_data_directory
    vmdb_connection_data_disk
    vmdb_connection_last_start_time
  ), "vmdb_connection_properties"

  include_examples "textual_group", "Capacity Data", %i(
    vmdb_connection_timestamp
    vmdb_connection_total_space
    vmdb_connection_used_space
    vmdb_connection_free_space
    vmdb_connection_total_index_nodes
    vmdb_connection_used_index_nodes
    vmdb_connection_free_index_nodes
  ), "vmdb_connection_capacity_data"

  context 'Tenant Textual Summary' do
    let(:record) { FactoryBot.create(:tenant) }

    describe '#textual_group_properties' do
      it 'returns Properties table for Tenant' do
        expect(textual_group_properties).to be_kind_of(TextualTags)
        expect(textual_group_properties.title).to eq("Properties")
        expect(textual_group_properties.items).to eq(%i[description parent groups subtenant project])
      end
    end

    include_examples 'textual_group', 'Relationships', %i[catalog_items automate_domains providers]

    include_examples 'textual_group_smart_management'

    describe '#textual_description' do
      it 'returns Description of a Tenant' do
        expect(textual_description[:label]).to eq('Description')
        expect(textual_description[:value]).to eq(record.description)
      end
    end

    describe '#textual_parent' do
      let(:user) { FactoryBot.create(:user_admin) }

      before { login_as user }

      context 'Tenant without Parent' do
        let(:record) { user.current_tenant }

        it 'returns nil for root Tenant' do
          expect(textual_parent).to be_nil
        end
      end

      context 'Tenant with Parent' do
        before do
          allow(User).to receive(:server_timezone).and_return("UTC")
          allow(MiqServer).to receive(:my_server).and_return(FactoryBot.create(:miq_server))
          allow(self).to receive(:url_for_only_path).and_return("/ops/tree_select/tn-#{record.parent.id}")
        end

        it 'returns Parent Tenant info' do
          expect(textual_parent[:label]).to eq('Parent')
          expect(textual_parent[:explorer]).to be(true)
          expect(textual_parent[:value]).to eq(record.parent.name)
          expect(textual_parent[:title]).to eq('View Parent Tenant')
          expect(textual_parent[:link]).to eq("/ops/tree_select/tn-#{record.parent.id}")
        end
      end
    end

    describe '#textual_groups' do
      it 'returns nil for Tenant without Groups' do
        expect(textual_groups).to be_nil
      end

      context 'Tenant with Groups' do
        let(:group) { FactoryBot.create(:miq_group) }

        before do
          allow(@record).to receive(:miq_groups).and_return([group])
          allow(@record.miq_groups).to receive(:non_tenant_groups).and_return([group])
          allow(self).to receive(:role_allows?).with(:feature => 'rbac_group_show').and_return(true)
          allow(self).to receive(:url_for_only_path).and_return("/ops/tree_select/g-#{group.id}")
        end

        it 'returns Groups' do
          expect(textual_groups[:label]).to eq('Groups')
          expect(textual_groups[:value]).to eq([{:value => group.name, :title => "Click to view #{group.name} Group", :explorer => true, :link => "/ops/tree_select/g-#{group.id}"}])
        end
      end
    end

    describe '#textual_subtenant' do
      it 'returns nil for Tenant without Child Tenants' do
        expect(textual_subtenant).to be_nil
      end

      context 'Tenant with Child Tenants' do
        let(:subtenant) { FactoryBot.create(:tenant, :parent => record) }

        before do
          allow(@record).to receive(:all_subtenants).and_return([subtenant])
          allow(self).to receive(:url_for_only_path).and_return("/ops/tree_select/tn-#{subtenant.id}")
        end

        it 'returns Child Tenants' do
          expect(textual_subtenant[:label]).to eq('Child Tenants')
          expect(textual_subtenant[:value]).to eq([{:value => subtenant.name, :title => "Click to view #{subtenant.name} Tenant", :explorer => true, :link => "/ops/tree_select/tn-#{subtenant.id}"}])
        end
      end
    end

    describe '#textual_project' do
      it 'returns nil for Tenant without Projects' do
        expect(textual_project).to be_nil
      end

      context 'Tenant with Projects' do
        let(:subproject) { FactoryBot.create(:tenant_project) }

        before do
          allow(@record).to receive(:all_subprojects).and_return([subproject])
          allow(self).to receive(:url_for_only_path).and_return("/ops/tree_select/tn-#{subproject.id}")
        end

        it 'returns Projects' do
          expect(textual_project[:label]).to eq('Projects')
          expect(textual_project[:value]).to eq([{:value => subproject.name, :title => "Click to view #{subproject.name} TenantProject", :explorer => true, :link => "/ops/tree_select/tn-#{subproject.id}"}])
        end
      end
    end

    describe '#textual_catalog_items' do
      it 'returns Catalog Items related to the Tenant' do
        expect(textual_catalog_items[:label]).to eq('Catalog Items and Bundles')
        expect(textual_catalog_items[:icon]).to eq('ff ff-group')
        expect(textual_catalog_items[:value]).to eq(0)
      end

      context 'positive number of relevant Catalog Items' do
        before do
          FactoryBot.create(:service_template, :tenant => record)
          allow(self).to receive(:url_for_only_path).and_return("/ops/show/#{record.id}?display=service_templates")
        end

        it 'returns Catalog Items related to the Tenant' do
          expect(textual_catalog_items[:value]).to eq(1)
          expect(textual_catalog_items[:link]).to eq("/ops/show/#{record.id}?display=service_templates")
          expect(textual_catalog_items[:title]).to eq('View the list of relevant Catalog Items and Bundles')
          expect(textual_catalog_items[:explorer]).to be(true)
        end
      end
    end

    describe '#textual_automate_domains' do
      it 'returns Automate Domains related to the Tenant' do
        expect(textual_automate_domains[:label]).to eq('Automate Domains')
        expect(textual_automate_domains[:icon]).to eq('ff ff-group')
        expect(textual_automate_domains[:value]).to eq(0)
      end

      context 'positive number of relevant Automate Domains' do
        before do
          FactoryBot.create(:miq_ae_domain, :tenant => record)
          allow(self).to receive(:url_for_only_path).and_return("/ops/show/#{record.id}?display=ae_namespaces")
        end

        it 'returns Catalog Items related to the Tenant' do
          expect(textual_automate_domains[:value]).to eq(1)
          expect(textual_automate_domains[:link]).to eq("/ops/show/#{record.id}?display=ae_namespaces")
          expect(textual_automate_domains[:title]).to eq('View the list of relevant Automate Domains')
          expect(textual_automate_domains[:explorer]).to be(true)
        end
      end
    end

    describe '#textual_providers' do
      it 'returns Automate Domains related to the Tenant' do
        expect(textual_providers[:label]).to eq('Providers')
        expect(textual_providers[:icon]).to eq('ff ff-group')
        expect(textual_providers[:value]).to eq(0)
      end

      context 'positive number of relevant Providers' do
        before do
          FactoryBot.create(:ext_management_system, :tenant => record)
          allow(self).to receive(:url_for_only_path).and_return("/ops/show/#{record.id}?display=providers")
        end

        it 'returns Catalog Items related to the Tenant' do
          expect(textual_providers[:value]).to eq(1)
          expect(textual_providers[:link]).to eq("/ops/show/#{record.id}?display=providers")
          expect(textual_providers[:title]).to eq('View the list of relevant Providers')
          expect(textual_providers[:explorer]).to be(true)
        end
      end
    end
  end
end

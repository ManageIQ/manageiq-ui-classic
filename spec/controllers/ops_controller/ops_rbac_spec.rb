describe OpsController do
  render_views

  describe "::Tenants" do
    before do
      Tenant.seed
      MiqRegion.seed
      stub_user(:features => :all)
      allow(controller).to receive(:data_for_breadcrumbs).and_return([{:title => "title", :action => "action", :key => "key"}])
    end

    describe "#rbac_edit_tags_reset" do
      let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
      let(:another_tenant) { FactoryBot.create(:tenant) }

      before do
        allow(controller).to receive(:checked_or_params).and_return(Tenant.all.ids)
        login_as admin_user
      end

      it "processes selected record" do
        allow(controller).to receive(:x_tags_set_form_vars)
        controller.instance_variable_set(:@sb, :pre_edit_node=> '')
        allow(controller).to receive(:replace_right_cell)
        expect(controller).to receive(:find_records_with_rbac).with(Tenant, Tenant.all.ids).and_return(Tenant.all)
        controller.send(:rbac_edit_tags_reset, "Tenant")
      end
    end
    let(:four_terabytes) { 4096 * 1024 * 1024 * 1024 }

    describe "#tree_select" do
      it "renders rbac_details tab when rbac_tree root node is selected" do
        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => 'root', :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)
      end

      it "renders tenants partial when tenant node is selected" do
        tenant = FactoryBot.create(:tenant, :parent => Tenant.root_tenant)

        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => "tn-#{tenant.id}", :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)
      end

      it "does not display tenant groups in the details paged" do
        tenant = FactoryBot.create(:tenant, :parent => Tenant.root_tenant)

        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => "tn-#{tenant.id}", :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)
        expect(response.body).not_to include('View this Group')
      end

      it "renders quota usage table for tenant" do
        tenant = FactoryBot.create(:tenant, :parent => Tenant.root_tenant)
        tenant.set_quotas(:cpu_allocated => {:value => 1024},
                          :vms_allocated => {:value => 27},
                          :mem_allocated => {:value => four_terabytes})

        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => "tn-#{tenant.id}", :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)

        tab_content = JSON.parse(response.body)['replacePartials']['ops_tabs']
        expect(tab_content).to include('Tenant Quota')
        expect(tab_content).to include('Name')
        expect(tab_content).to include('Total Quota')
        expect(tab_content).to include('In Use')
        expect(tab_content).to include('4096.0 GB')
        expect(tab_content).to include('1024 Count')
        expect(tab_content).to include('27 Count')
      end
    end

    describe "#rbac_tenant_get_details" do
      it "sets @tenant record" do
        t = FactoryBot.create(:tenant, :parent => Tenant.root_tenant, :subdomain => "foo")
        controller.send(:rbac_tenant_get_details, t.id)
        expect(assigns(:tenant)).to eq(t)
      end

      context "user is using tag filtering" do
        let(:user) { FactoryBot.create(:user, :miq_groups => [group]) }
        let(:group) { FactoryBot.create(:miq_group, :tenant => other_tenant) }
        let!(:other_tenant) { FactoryBot.create(:tenant, :parent => Tenant.root_tenant) }

        before do
          group.entitlement = Entitlement.new
          group.entitlement.set_belongsto_filters([])
          group.entitlement.set_managed_filters([['/managed/environment/prod']])
          group.save!

          login_as user
        end

        it "raises error when access is not granted" do
          expect { controller.send(:rbac_tenant_get_details, other_tenant.id) }.to raise_error(MiqException::RbacPrivilegeException, "Can't access selected records")
        end
      end
    end

    describe "#rbac_tenant_delete" do
      before do
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
        @t = FactoryBot.create(:tenant, :parent => Tenant.root_tenant)
        sb_hash = {
          :trees       => {:rbac_tree => {:active_node => "tn-#{@t.id}"}},
          :active_tree => :rbac_tree,
          :active_tab  => "rbac_details"
        }
        controller.instance_variable_set(:@sb, sb_hash)
        controller.params = {:id => @t.id}
        expect(controller).to receive(:render)
      end

      it "deletes a tenant record successfully" do
        expect(controller).to receive(:x_active_tree_replace_cell)
        expect(MiqProductFeature).to receive(:invalidate_caches)

        controller.send(:rbac_tenant_delete)

        expect(response.status).to eq(200)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Delete successful")
        expect(flash_message[:level]).to be(:success)
      end

      it "returns error flash when tenant cannot be deleted" do
        FactoryBot.create(:miq_group, :tenant => @t)
        controller.send(:rbac_tenant_delete)

        expect(response.status).to eq(200)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Error during delete")
        expect(flash_message[:level]).to be(:error)
      end

      it "deletes checked tenant records successfully" do
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
        t = FactoryBot.create(:tenant, :parent => Tenant.root_tenant)
        sb_hash = {
          :trees       => {:rbac_tree => {:active_node => "tn-#{t.id}"}},
          :active_tree => :rbac_tree,
          :active_tab  => "rbac_details"
        }
        controller.instance_variable_set(:@sb, sb_hash)
        allow(controller).to receive(:find_checked_items).and_return([t.id])
        expect(controller).to receive(:x_active_tree_replace_cell)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_delete)

        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Delete successful")
        expect(flash_message[:level]).to be(:success)
      end
    end

    describe "#rbac_tenants_list" do
      it "gets the list of tenants by calling get_view with correct args" do
        controller.instance_variable_set(:@sb, {})
        controller.instance_variable_set(:@settings, {})
        expect(controller).to receive(:get_view).with(Tenant, {:named_scope => :in_my_region}).and_return(
          [double('view', :table => double('table', :data => [])), {}]
        )
        controller.send(:rbac_tenants_list)
        expect(response.status).to eq(200)
        expect(assigns(:view)).not_to be_nil
        expect(assigns(:pages)).not_to be_nil
      end

      context 'get_view' do
        it "returns the list of tenants" do
          view, pages = controller.send(:get_view, Tenant, {:named_scope => :in_my_region}, true)
          expect(view).not_to be_nil
          expect(pages).not_to be_nil
        end
      end
    end

    describe "#tags_edit" do
      let!(:user) { stub_user(:features => :all) }

      before do
        @tenant = FactoryBot.create(:tenant,
                                    :name      => "OneTenant",
                                    :parent    => Tenant.root_tenant,
                                    :domain    => "test",
                                    :subdomain => "test")
        sb_hash = { :trees       => {:rbac_tree => {:active_node => "tn-#{@tenant.id}"}},
                    :active_tree => :rbac_tree,
                    :active_tab  => "rbac_details"}
        controller.instance_variable_set(:@sb, sb_hash)
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
        allow(@tenant).to receive(:tagged_with).with({:cat => user.userid}).and_return("my tags")
        classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
        @tag1 = FactoryBot.create(:classification_tag,
                                  :name   => "tag1",
                                  :parent => classification)
        @tag2 = FactoryBot.create(:classification_tag,
                                  :name   => "tag2",
                                  :parent => classification)
        allow(Classification).to receive(:find_assigned_entries).with(@tenant).and_return([@tag1, @tag2])
        controller.instance_variable_set(:@sb,
                                         :trees       => {:rbac_tree => {:active_node => "root"}},
                                         :active_tree => :rbac_tree)
        allow(controller).to receive(:get_node_info)
        allow(controller).to receive(:replace_right_cell)
        session[:tag_db] = "Tenant"
        edit = { :key        => "Tenant_edit_tags__#{@tenant.id}",
                 :tagging    => "Tenant",
                 :object_ids => [@tenant.id],
                 :current    => {:assignments => []},
                 :new        => {:assignments => [@tag1.id, @tag2.id]}}
        session[:edit] = edit
      end

      it "builds tagging screen" do
        EvmSpecHelper.create_guid_miq_server_zone

        allow(controller).to receive(:button_url).with("ops", @tenant.id, "save").and_return("save_url")
        allow(controller).to receive(:button_url).with("ops", @tenant.id, "cancel").and_return("cancel_url")
        controller.instance_variable_set(:@sb, :action => "rbac_tenant_tags_edit")
        controller.params = {:miq_grid_checks => @tenant.id.to_s}
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array)).to be_nil
        expect(response.status).to eq(200)
      end

      it "cancels tags edit" do
        controller.params = {:button => "cancel", :id => @tenant.id}
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array).first[:message]).to include("was cancelled")
        expect(assigns(:edit)).to be_nil
        expect(response.status).to eq(200)
      end

      it "resets tags edit" do
        allow(controller).to receive(:button_url).with("ops", @tenant.id, "save").and_return("save_url")
        allow(controller).to receive(:button_url).with("ops", @tenant.id, "cancel").and_return("cancel_url")
        controller.params = {:button => "reset", :id => @tenant.id}
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array).first[:message]).to include("All changes have been reset")
        expect(response.status).to eq(200)
      end

      it "save tags" do
        controller.params = {:button => "save", :id => @tenant.id, 'data' => get_tags_json([@tag1, @tag2])}
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
        expect(assigns(:edit)).to be_nil
        expect(response.status).to eq(200)
      end
    end
  end

  describe "#group_form_data" do
    let(:stub_tree) do
      instance_double(TreeBuilderBelongsToHac,
                      :bs_tree => '[{"key":"root","text":"My Cloud","nodes":[]}]',
                      :paths   => {"root" => "/belongsto/ExtManagementSystem|My Cloud"})
    end

    before do
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      Tenant.seed
      stub_user(:features => :all)
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}

      # TreeBuilderBelongsToHac/Vat walk VM infrastructure which is absent in
      # unit tests. Stub them out so group_form_data can focus on its own logic.
      allow(TreeBuilderBelongsToHac).to receive(:new).and_return(stub_tree)
      allow(TreeBuilderBelongsToVat).to receive(:new).and_return(stub_tree)
    end

    context "for a new group" do
      it "returns 200 with the expected JSON keys" do
        get :group_form_data, :params => {:id => "new"}

        expect(response.status).to eq(200)
        body = response.parsed_body
        expect(body).to include("hac_tree", "vat_tree", "hac_paths", "vat_paths",
                                "tags", "deleted_belongsto_filters")
      end

      it "returns empty deleted_belongsto_filters for a new group" do
        get :group_form_data, :params => {:id => "new"}

        expect(response.parsed_body["deleted_belongsto_filters"]).to eq([])
      end

      it "returns tags structure with tags/assignedTags/affectedItems keys" do
        get :group_form_data, :params => {:id => "new"}

        tags_payload = response.parsed_body["tags"]
        expect(tags_payload).to include("tags", "assignedTags", "affectedItems")
      end
    end

    it "returns the tree builder paths" do
      get :group_form_data, :params => {:id => "new"}

      expect(response.parsed_body["hac_paths"]).to eq("root" => "/belongsto/ExtManagementSystem|My Cloud")
      expect(response.parsed_body["vat_paths"]).to eq("root" => "/belongsto/ExtManagementSystem|My Cloud")
    end

    context "when read_only is not requested" do
      before { FactoryBot.create(:classification_department_with_tags) }

      it "builds editable trees and returns the tag catalogue" do
        expect(TreeBuilderBelongsToHac).to receive(:new).with(anything, anything, anything, hash_including(:edit => true)).and_return(stub_tree)
        expect(TreeBuilderBelongsToVat).to receive(:new).with(anything, anything, anything, hash_including(:edit => true)).and_return(stub_tree)

        get :group_form_data, :params => {:id => "new"}

        expect(response.parsed_body.dig("tags", "tags").pluck("id")).to include("department")
      end
    end

    context "when read_only=true" do
      before { FactoryBot.create(:classification_department_with_tags) }

      it "builds non-editable trees and skips the tag catalogue" do
        expect(TreeBuilderBelongsToHac).to receive(:new).with(anything, anything, anything, hash_including(:edit => false)).and_return(stub_tree)
        expect(TreeBuilderBelongsToVat).to receive(:new).with(anything, anything, anything, hash_including(:edit => false)).and_return(stub_tree)

        get :group_form_data, :params => {:id => "new", :read_only => "true"}

        expect(response.parsed_body["tags"]).to include("tags" => [], "assignedTags" => [], "affectedItems" => [""])
      end
    end

    context "for an existing group" do
      let!(:group) { FactoryBot.create(:miq_group) }

      it "returns 200 with the expected JSON keys" do
        get :group_form_data, :params => {:id => group.id.to_s}

        expect(response.status).to eq(200)
        body = response.parsed_body
        expect(body).to include("hac_tree", "vat_tree", "hac_paths", "vat_paths",
                                "tags", "deleted_belongsto_filters")
      end

      it "includes the group id in the affectedItems array" do
        get :group_form_data, :params => {:id => group.id.to_s}

        affected = response.parsed_body.dig("tags", "affectedItems")
        expect(affected).to include(group.id.to_s)
      end

      it "returns one assignedTags entry per category with all of its values" do
        FactoryBot.create(:classification_department_with_tags)
        group.entitlement = Entitlement.new
        group.entitlement.set_managed_filters([%w[/managed/department/accounting /managed/department/finance]])
        group.save!

        get :group_form_data, :params => {:id => group.id.to_s}

        assigned = response.parsed_body.dig("tags", "assignedTags")
        expect(assigned.size).to eq(1)
        expect(assigned.first).to include("id" => "department", "label" => "Department")
        expect(assigned.first["values"].pluck("id")).to match_array(%w[accounting finance])
      end
    end
  end

  describe "#rbac_role_set_form_vars" do
    before do
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      stub_user(:features => :all)
      @vm_role = FactoryBot.create(:miq_user_role, :features => %w(embedded_automation_manager))
    end

    it "the feature list to edit should contain the children roles" do
      EvmSpecHelper.seed_specific_product_features(%w(everything embedded_automation_manager embedded_configuration_script_source_view))
      sb_hash = {:trees => {:active_tree => :rbac_tree, :typ => 'new'}}
      controller.instance_variable_set(:@sb, sb_hash)
      record = MiqUserRole.new
      record.miq_product_features = [MiqProductFeature.find_by(:identifier => MiqProductFeature.feature_root)]
      controller.instance_variable_set(:@record, record)
      allow(controller).to receive(:replace_right_cell)
      allow(controller).to receive(:build_rbac_feature_tree)
      controller.params = {:button => "add"}

      new = {:features => ["everything"], :name => "foo"}
      edit = {:key     => "rbac_role_edit__new",
              :new     => new,
              :current => new}
      session[:edit] = edit
      controller.send(:rbac_role_set_form_vars)
      expect(controller.instance_variable_get(:@edit)[:new][:features]).to include('embedded_configuration_script_source_view')
    end
  end

  render_views

  describe "::MiqRegion" do
    before do
      EvmSpecHelper.local_miq_server
      EvmSpecHelper.seed_specific_product_features(%w(ops_rbac))
      root_tenant = Tenant.seed
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      role = MiqUserRole.find_by(:name => "EvmRole-super_administrator")
      @t1 = FactoryBot.create(:tenant, :name => "ten1", :parent => root_tenant)
      @g1 = FactoryBot.create(:miq_group, :description => 'group1', :tenant => @t1, :miq_user_role => role)
      @u1 = FactoryBot.create(:user, :miq_groups => [@g1])
      @t2 = FactoryBot.create(:tenant, :name => "ten2", :parent => root_tenant)
      @g2a  = FactoryBot.create(:miq_group, :description => 'gr2a', :tenant => @t2, :miq_user_role => role)
      @g2b  = FactoryBot.create(:miq_group, :description => 'gr2b1', :tenant => @t2, :miq_user_role => role)
      @u2a = FactoryBot.create(:user, :miq_groups => [@g2a])
      @u2a2 = FactoryBot.create(:user, :miq_groups => [@g2a])
      @u2b = FactoryBot.create(:user, :miq_groups => [@g2b])
      @u2b2 = FactoryBot.create(:user, :miq_groups => [@g2b])
      @u2b3 = FactoryBot.create(:user, :miq_groups => [@g2b])
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)
    end

    it "displays the access object count for the current tenant" do
      login_as @u1
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)
      post :tree_select, :params => { :id => 'root', :format => :js }
      expect(controller.instance_variable_get(:@groups_count)).to eq(1)
      expect(controller.instance_variable_get(:@tenants_count)).to eq(1)
      expect(controller.instance_variable_get(:@users_count)).to eq(1)
    end

    it "displays the access object count for the current user" do
      login_as @u2a
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)
      post :tree_select, :params => { :id => 'root', :format => :js }
      expect(controller.instance_variable_get(:@groups_count)).to eq(2)
      expect(controller.instance_variable_get(:@tenants_count)).to eq(1)
      expect(controller.instance_variable_get(:@users_count)).to eq(5)
    end
  end

  describe "#rbac_get_info" do
    before do
      EvmSpecHelper.local_miq_server
      login_as admin_user
      MiqRegion.seed
    end

    let!(:root_tenant) { Tenant.seed } # creates first root Tenant in active region
    let(:group) { FactoryBot.create(:miq_group) }
    let(:inactive_region) { FactoryBot.create(:miq_region) }
    let!(:root_tenant_in_inactive_region) do
      tenant = FactoryBot.create(:tenant, :in_other_region, :other_region => inactive_region)
      tenant.update_attribute(:parent, nil) # rubocop:disable Rails/SkipsModelValidations
      tenant
    end
    let!(:group_in_inactive_region) { FactoryBot.create(:miq_group, :in_other_region, :other_region => inactive_region) }
    let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }

    it 'counts only Tenants in active region' do
      allow(controller).to receive(:x_node).and_return('root')
      controller.send(:rbac_get_info)
      expect(controller.instance_variable_get(:@tenants_count)).to eq(Tenant.in_my_region.count)
      expect(controller.instance_variable_get(:@tenants_count)).not_to eq(Tenant.count)
    end

    it 'counts only MiqGroups in active region' do
      allow(controller).to receive(:x_node).and_return('root')
      controller.send(:rbac_get_info)
      expect(controller.instance_variable_get(:@groups_count)).to eq(MiqGroup.non_tenant_groups_in_my_region.count)
      expect(controller.instance_variable_get(:@groups_count)).not_to eq(MiqGroup.count)
    end
  end

  describe "#rbac_user_delete_restriction?" do
    let(:default_admin_user) { FactoryBot.create(:user, :userid => "admin", :role => "super_administrator") }
    let(:custom_admin_user) { FactoryBot.create(:user, :userid => "somename", :role => "super_administrator") }
    let(:other_user) { FactoryBot.create(:user) }

    it "returns true because user is default super admin" do
      expect(controller.send(:rbac_user_delete_restriction?, default_admin_user)).to be_truthy
    end

    it "returns false because user is custom super admin" do
      expect(controller.send(:rbac_user_delete_restriction?, custom_admin_user)).to be_falsy
    end

    it "returns true because user is current user" do
      User.with_user(other_user) do
        expect(controller.send(:rbac_user_delete_restriction?, other_user)).to be_truthy
      end
    end
  end

  describe "#rbac_group_seq_field_changed" do
    let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
    let!(:group1) { FactoryBot.create(:miq_group, :description => "Group 1", :sequence => 1) }
    let!(:group2) { FactoryBot.create(:miq_group, :description => "Group 2", :sequence => 2) }

    before do
      EvmSpecHelper.local_miq_server
      login_as admin_user
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      session[:edit] = {
        :key     => "rbac_group_edit__seq",
        :new     => {:external_auth_groups => [group1, group2], :external_auth_groups_list => ["Group 1", "Group 2"]},
        :current => {:external_auth_groups => [group1, group2], :external_auth_groups_list => ["Group 1", "Group 2"]}
      }
    end

    it "reorders items and activates save/reset buttons when moved up" do
      post :rbac_group_seq_field_changed, :params => {:button => "up", :seq_fields => ["Group 2"], :id => "seq"}, :xhr => true
      expect(response.status).to eq(200)
      expect(response.body).to include("miqButtons('show')")
      expect(controller.instance_variable_get(:@edit)[:new][:external_auth_groups_list]).to eq(["Group 2", "Group 1"])
    end

    it "reorders items and activates save/reset buttons when moved down" do
      post :rbac_group_seq_field_changed, :params => {:button => "down", :seq_fields => ["Group 1"], :id => "seq"}, :xhr => true
      expect(response.status).to eq(200)
      expect(response.body).to include("miqButtons('show')")
      expect(controller.instance_variable_get(:@edit)[:new][:external_auth_groups_list]).to eq(["Group 2", "Group 1"])
    end
  end

  describe "#rbac_group_seq_edit" do
    let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
    let!(:group1) { FactoryBot.create(:miq_group, :description => "Group 1", :sequence => 1) }
    let!(:group2) { FactoryBot.create(:miq_group, :description => "Group 2", :sequence => 2) }

    before do
      EvmSpecHelper.local_miq_server
      login_as admin_user
      allow(controller).to receive(:x_node).and_return("root")
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
    end

    it "initializes the sequence edit screen" do
      post :rbac_group_seq_edit, :xhr => true
      expect(response.status).to eq(200)
      expect(controller.instance_variable_get(:@edit)[:key]).to eq("rbac_group_edit__seq")
      expect(controller.instance_variable_get(:@edit)[:new][:external_auth_groups_list]).to include("Group 1", "Group 2")
    end

    it "saves the reordered sequence" do
      session[:edit] = {
        :key     => "rbac_group_edit__seq",
        :new     => {:external_auth_groups => [group1, group2], :external_auth_groups_list => ["Group 2", "Group 1"]},
        :current => {:external_auth_groups => [group1, group2], :external_auth_groups_list => ["Group 1", "Group 2"]}
      }
      post :rbac_group_seq_edit, :params => {:button => "save"}, :xhr => true
      expect(response.status).to eq(200)
      expect(group1.reload.sequence).to eq(2)
      expect(group2.reload.sequence).to eq(1)
    end

    it "cancels the edit sequence" do
      session[:edit] = {:key => "rbac_group_edit__seq"}
      post :rbac_group_seq_edit, :params => {:button => "cancel"}, :xhr => true
      expect(response.status).to eq(200)
      expect(session[:edit]).to be_nil
    end
  end
end

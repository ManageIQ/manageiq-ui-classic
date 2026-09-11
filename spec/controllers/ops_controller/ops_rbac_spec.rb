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

  describe "::MiqGroup" do
    let(:classification) { FactoryBot.create(:classification, :name => "department", :description => "Department") }
    let(:tag) { FactoryBot.create(:classification_tag, :name => "tag1", :parent => classification) }

    before do
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      Tenant.seed

      stub_user(:features => :all)
      @group = FactoryBot.create(:miq_group)
      @role = MiqUserRole.find_by(:name => "EvmRole-operator")
      FactoryBot.create(
        :classification,
        :name        => "env",
        :description => "Environment",
        :children    => [FactoryBot.create(:classification)]
      )
      @exp = MiqExpression.new("=" => {:tag => "name", :value => "Test"}, :token => 1)
      allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
    end

    render_views

    it "uses tags field only when editing the group filter_expression" do
      new = {:use_filter_expression => true,
             :name                  => 'Name',
             :description           => "Test",
             :role                  => @role.id,
             :filter_expression     => @exp.exp,
             :exp_key               => 'foo',
             :belongsto             => {},
             :filters               => {'managed/env' => '/managed/env'}}
      allow(controller).to receive(:replace_right_cell)
      controller.params = {:use_filter_expression => "true", :id => "new"}

      edit = {:key      => "rbac_group_edit__new",
              :new      => new,
              :current  => new,
              :edit_exp => {:key => '???'}}
      edit[:filter_expression] ||= ApplicationController::Filter::Expression.new
      edit[:filter_expression][:expression] = {:test => "foo", :token => 1}
      edit[:new][:filter_expression] = copy_hash(edit[:filter_expression][:expression])
      edit[:filter_expression].history.reset(edit[:filter_expression][:expression])
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@expkey, :filter_expression)
      edit[:filter_expression][:exp_table] = controller.send(:exp_build_table, edit[:filter_expression][:expression])
      edit[:filter_expression][:exp_model] = @group.class.to_s
      session[:edit] = edit
      session[:expkey] = :filter_expression
      controller.instance_variable_set(:@edit, edit)
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)

      post :tree_select, :params => { :id => 'root', :format => :js }
      expect(MiqExpression).to receive(:tag_details)

      post :exp_token_pressed, :params => {:id => 'new', :use_filter_expression => "true", :token => 1}
      @edit = controller.instance_variable_get(:@edit)
      expect(@edit[:filter_expression][:exp_typ]).to eq('tags')
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

end

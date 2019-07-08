describe ReportController do
  context "::Dashboards" do
    let(:miq_widget_set) { FactoryBot.create(:miq_widget_set, :owner => user.current_group, :set_data => {:col1 => [], :col2 => [], :col3 => []}) }
    let(:user)           { FactoryBot.create(:user, :features => "db_edit") }

    before do
      stub_user(:features => :all)
    end

    describe "#db_copy" do
      context "when save button" do
        it "saves successfully" do
          params = {:button => "save", :dashboard_id => miq_widget_set.id.to_s, :group_id => user.current_group.id.to_s, :name => 'New Name', :description => 'New description'}
          post :db_copy, :params => params

          expect(JSON.parse(response.body)).to eq({"name" => miq_widget_set.name})
          expect(response.status).to eq(200)
          expect(MiqWidgetSet.last.name).to eq("New Name")
          expect(MiqWidgetSet.last.description).to eq("New description")
          expect(MiqWidgetSet.last.group_id).to eq(miq_widget_set.group_id)
          expect(MiqWidgetSet.last.set_data).to eq(miq_widget_set.set_data)
          expect(MiqWidgetSet.last.guid).not_to eq(miq_widget_set.guid)
        end

        it "saves unsuccessfully and returns error message" do
          params = {:button => "save", :dashboard_id => miq_widget_set.id.to_s, :group_id => user.current_group.id.to_s, :name => miq_widget_set.name.to_s, :description => 'New description'}
          post :db_copy, :params => params

          expect(JSON.parse(response.body)["error"]["message"]).to include("Error")
          expect(response.status).to eq(400)
        end
      end

      context "when cancel button" do
        it "cancels " do
          controller.instance_variable_set(:@sb, {})

          expect(controller).to receive(:get_node_info)
          expect(controller).to receive(:replace_right_cell)
          expect(controller).to receive(:add_flash)

          controller.params = {:button => "cancel"}
          controller.send(:db_copy)
          expect(assigns(:dashboard)).to eq(nil)
        end
      end

      context "when no button" do
        it "sets variables" do
          allow(controller).to receive(:find_record_with_rbac).and_return(miq_widget_set)

          expect(controller).to receive(:replace_right_cell).with(:action => "copy_dashboard")

          controller.send(:db_copy)

          expect(assigns(:tabactive)).to eq(false)
          expect(assigns(:in_a_form)).to eq(true)
          expect(assigns(:right_cell_text)).to eq("Copy of \"%{dashboard}\" Dashboard" % {:dashboard => miq_widget_set.name})
        end
      end
    end

    describe "#dashboard_get" do
      it "finds by id" do
        get :dashboard_get, :params => {:id => miq_widget_set.id.to_s}

        expect(JSON.parse(response.body)).to eq(
          "description" => miq_widget_set.description.to_s,
          "name"        => miq_widget_set.name.to_s,
          "owner_id"    => miq_widget_set.owner_id.to_s
        )
      end

      it "finds by name" do
        get :dashboard_get, :params => {:id => miq_widget_set.id.to_s, :name => miq_widget_set.name.to_s}

        expect(JSON.parse(response.body)).to eq("length" => 1)
      end

      it "finds by not existing name" do
        get :dashboard_get, :params => {:id => miq_widget_set.id.to_s, :name => "blabla"}

        expect(JSON.parse(response.body)).to eq("length" => 0)
      end
    end

    describe "#dashboard_render" do
      it "renders" do
        controller.instance_variable_set(:@sb, {})

        expect(controller).to receive(:get_node_info)
        expect(controller).to receive(:replace_right_cell).with(:replace_trees => [:db])
        expect(controller).to receive(:add_flash)

        controller.send(:dashboard_render)
        expect(assigns(:dashboard)).to eq(nil)
      end
    end

    describe "#db_edit" do
      it "dashboard owner remains unchanged" do
        allow(controller).to receive(:db_fields_validation)
        allow(controller).to receive(:replace_right_cell)
        owner = miq_widget_set.owner
        new_hash = {:name => "New Name", :description => "New Description", :col1 => [1], :col2 => [], :col3 => []}
        current = {:name => "New Name", :description => "New Description", :col1 => [], :col2 => [], :col3 => []}
        controller.instance_variable_set(:@edit, :new => new_hash, :db_id => miq_widget_set.id, :current => current)
        controller.params = {:id => miq_widget_set.id, :button => "save"}
        controller.db_edit
        expect(miq_widget_set.owner.id).to eq(owner.id)
        expect(assigns(:flash_array).first[:message]).to include("saved")
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end
    end

    describe "#db_save_members" do
      let(:set_data) do
        Array.new(3) { |n| ["col#{(n + 1)}".to_sym, Array.new(2, FactoryBot.create(:miq_widget))] }.to_h
      end

      before do
        miq_widget_set.update!(:set_data => set_data)

        login_as user

        EvmSpecHelper.local_miq_server
      end

      it 'establishes relations between MiqWidgetSet and MiqWidgets thru Relationship table' do
        controller.instance_variable_set(:@dashboard, miq_widget_set)

        controller.send(:db_save_members)

        miq_widget_set.reload
        expect(miq_widget_set.members.uniq).to match_array((set_data[:col1] + set_data[:col2] + set_data[:col3]).uniq)
      end
    end

    describe "#db_fields_validation" do
      before do
        @widget1 = FactoryBot.create(:miq_widget)
        @widget2 = FactoryBot.create(:miq_widget)
        @miq_widget_set = FactoryBot.create(:miq_widget_set,
                                            :owner       => user.current_group,
                                            :name        => "fred",
                                            :description => "FRED",
                                            :set_data    => {:col1 => [@widget1.id], :col2 => [], :col3 => []})
        FactoryBot.create(:miq_widget_set,
                          :owner       => user.current_group,
                          :name        => "wilma",
                          :description => "WILMA",
                          :set_data    => {:col1 => [@widget2.id], :col2 => [], :col3 => []})
        login_as user
        EvmSpecHelper.local_miq_server
      end

      it 'display flash message for uniqueness of tab title of dashboard within a group' do
        controller.instance_variable_set(:@sb, :nodes => ["xx", "g_g", "#{user.current_group.id}_", @miq_widget_set.id])
        controller.instance_variable_set(:@edit, :db_id => @miq_widget_set.id, :read_only => false, :type => "db_edit", :key => "db_edit__#{@miq_widget_set.id}",
                                                  :new => {:name => "fred", :description => "WILMA", :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []},
                                                  :current => {:name => "fred", :description => "FRED", :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []})
        controller.send(:db_fields_validation)
        expect(assigns(:flash_array).first[:message]).to include("Tab Title must be unique for this group")
      end

      it 'No flash message set when tab title is unique within a group' do
        controller.instance_variable_set(:@sb, :nodes => ["xx", "g_g", "#{user.current_group.id}_", @miq_widget_set.id])
        controller.instance_variable_set(:@edit, :db_id => @miq_widget_set.id, :read_only => false, :type => "db_edit", :key => "db_edit__#{@miq_widget_set.id}",
                                                 :new => {:name => "fred", :description => "NEW TAB TITLE", :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []},
                                                 :current => {:name => "fred", :description => "FRED", :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []})
        controller.send(:db_fields_validation)
        expect(assigns(:flash_array)).to be_nil
      end

      it 'No flash message set when tab title is changed for read-only Dashboard' do
        dashboard = FactoryBot.create(:miq_widget_set, :read_only => true, :set_data => {:col1 => [@widget1.id], :col2 => [], :col3 => []})
        controller.instance_variable_set(:@sb, :nodes => ["xx", dashboard.id])
        controller.instance_variable_set(:@edit, :db_id => @miq_widget_set.id, :read_only => true, :type => "db_edit", :key => "db_edit__#{@miq_widget_set.id}",
                                                 :new => {:name => "default", :description => "NEW #{dashboard.description}", :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []},
                                                 :current => {:name => "default", :description => dashboard.description, :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []})
        controller.send(:db_fields_validation)
        expect(assigns(:flash_array)).to be_nil
      end
    end
  end
end

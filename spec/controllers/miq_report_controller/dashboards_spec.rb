describe ReportController do
  context "::Dashboards" do
    context "#db_edit" do
      let(:user) { FactoryGirl.create(:user, :features => "db_edit") }
      before :each do
        login_as user
        @db = FactoryGirl.create(:miq_widget_set,
                                 :owner    => user.current_group,
                                 :set_data => {:col1 => [], :col2 => [], :col3 => []})
      end

      it "dashboard owner remains unchanged" do
        allow(controller).to receive(:db_fields_validation)
        allow(controller).to receive(:replace_right_cell)
        owner = @db.owner
        new_hash = {:name => "New Name", :description => "New Description", :col1 => [1], :col2 => [], :col3 => []}
        current = {:name => "New Name", :description => "New Description", :col1 => [], :col2 => [], :col3 => []}
        controller.instance_variable_set(:@edit, :new => new_hash, :db_id => @db.id, :current => current)
        controller.instance_variable_set(:@_params, :id => @db.id, :button => "save")
        controller.db_edit
        expect(@db.owner.id).to eq(owner.id)
        expect(assigns(:flash_array).first[:message]).to include("saved")
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end
    end

    describe "#db_fields_validation" do
      before do
        @widget1 = FactoryGirl.create(:miq_widget)
        @widget2 = FactoryGirl.create(:miq_widget)
        @miq_widget_set = FactoryGirl.create(:miq_widget_set,
                                             :owner       => user.current_group,
                                             :name        => "fred",
                                             :description => "FRED",
                                             :set_data    => {:col1 => [@widget1.id], :col2 => [], :col3 => []})
        FactoryGirl.create(:miq_widget_set,
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

      it 'No flash message set when tab title is changed for Default Dashboard' do
        default_dashboard = FactoryGirl.create(:miq_widget_set, :read_only => true, :name => "default", :description => "Default Dashboard", :set_data => {:col1 => [@widget1.id], :col2 => [], :col3 => []})
        controller.instance_variable_set(:@sb, :nodes => ["xx", default_dashboard.id])
        controller.instance_variable_set(:@edit, :db_id => @miq_widget_set.id, :read_only => true, :type => "db_edit", :key => "db_edit__#{@miq_widget_set.id}",
                                                 :new => {:name => "default", :description => "NEW Default Dashboard", :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []},
                                                 :current => {:name => "default", :description => "Default Dashboard", :locked => false, :col1 => [@widget1.id], :col2 => [], :col3 => []})
        controller.send(:db_fields_validation)
        expect(assigns(:flash_array)).to be_nil
      end
    end
  end
end

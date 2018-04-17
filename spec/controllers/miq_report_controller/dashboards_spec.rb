describe ReportController do
  context "::Dashboards" do
    let(:miq_widget_set) { FactoryGirl.create(:miq_widget_set, :owner => user.current_group, :set_data => {:col1 => [], :col2 => [], :col3 => []}) }
    let(:user)           { FactoryGirl.create(:user, :features => "db_edit") }

    before do
      login_as user
    end

    describe "#db_edit" do
      it "dashboard owner remains unchanged" do
        allow(controller).to receive(:db_fields_validation)
        allow(controller).to receive(:replace_right_cell)
        owner = miq_widget_set.owner
        new_hash = {:name => "New Name", :description => "New Description", :col1 => [1], :col2 => [], :col3 => []}
        current = {:name => "New Name", :description => "New Description", :col1 => [], :col2 => [], :col3 => []}
        controller.instance_variable_set(:@edit, :new => new_hash, :db_id => miq_widget_set.id, :current => current)
        controller.instance_variable_set(:@_params, :id => miq_widget_set.id, :button => "save")
        controller.db_edit
        expect(miq_widget_set.owner.id).to eq(owner.id)
        expect(assigns(:flash_array).first[:message]).to include("saved")
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end
    end

    describe "#db_save_members" do
      let(:set_data) do
        Array.new(3) { |n| ["col#{(n + 1)}".to_sym, Array.new(2, FactoryGirl.create(:miq_widget))] }.to_h
      end

      before do
        miq_widget_set.update_attributes!(:set_data => set_data)

        login_as user

        EvmSpecHelper.local_miq_server
      end

      it 'establishes relations between MiqWidgetSet and MiqWidgets thru Relationship table' do
        controller.instance_variable_set(:@db, miq_widget_set)

        controller.send(:db_save_members)

        miq_widget_set.reload
        expect(miq_widget_set.members).to match_array(MiqWidget.all)
      end
    end
  end
end

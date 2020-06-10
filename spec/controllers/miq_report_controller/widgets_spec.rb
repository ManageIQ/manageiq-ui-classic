describe ReportController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    stub_user(:features => :all)
  end
  describe "#widget_edit" do
    let(:miq_schedule) { FactoryBot.build(:miq_schedule, :run_at => {}, :sched_action => {}) }
    let(:new_widget) { controller.instance_variable_get(:@widget) }

    # Configuration Management/Virtual Machines/VMs with Free Space > 50% by Department report
    let(:report_id) { 100_000_000_000_01 }

    before do
      @previous_count_of_widgets = MiqWidget.count
      allow(controller).to receive_messages(:load_edit => true)
      allow(controller).to receive(:widget_graph_menus)
      allow(controller).to receive(:replace_right_cell)
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :wtype => 'c') # chart widget
    end

    context "add new widget" do
      before do
        controller.params = {:button => "add"}
      end

      context "valid attributes" do
        before do
          timer = ReportHelper::Timer.new('Hourly', 1, 1, 1, 1, '11/13/2015', '00', '10')
          controller.instance_variable_set(:@edit,
                                           :schedule => miq_schedule, :new => {:title => "NewCustomWidget",
                                                                               :description => "NewCustomWidget",
                                                                               :enabled => true, :roles => ["_ALL_"],
                                                                               :groups => [],
                                                                               :timer => timer,
                                                                               :repfilter => report_id})
          controller.send(:widget_edit)
        end

        it "adds new widget with entered attributes" do
          expect(MiqWidget.count).to eq(@previous_count_of_widgets + 1)
          expect(new_widget.errors.count).to eq(0)
          expect(new_widget.title).to eq("NewCustomWidget")
          expect(new_widget.description).to eq("NewCustomWidget")
          expect(new_widget.enabled).to eq(true)
        end

        it "creates widget with widget.id in 'value' field from cond. of MiqExpression (in MiqSchedule.filter)" do
          expect(new_widget.id).to be_a_kind_of(Integer)
          expect(miq_schedule.filter.exp["="]["value"]).to eq(new_widget.id)
        end
      end

      context "invalid attributes" do
        before do
          timer = ReportHelper::Timer.new('Hourly', 1, 1, 1, 1, '11/13/2015', '00', '10')
          controller.instance_variable_set(:@edit,
                                           :schedule => miq_schedule, :new => {:title => "",
                                                                               :description => "",
                                                                               :enabled => true, :roles => ["_ALL_"],
                                                                               :groups => [],
                                                                               :timer => timer,
                                                                               :repfilter => report_id})
          controller.send(:widget_edit)
        end

        it "doesn't add new widget" do
          expect(MiqWidget.count).to eq(@previous_count_of_widgets)
          expect(new_widget.errors.count).not_to eq(0)
        end
      end
    end
  end

  describe '#widget_validate_entries' do
    let(:widget) { FactoryBot.create(:miq_widget, :read_only => true, :options => {}) }
    let(:flash_array) { controller.instance_variable_get(:@flash_array) }

    it 'fails when trying to change a read-only widget' do
      @controller.instance_variable_set(:@widget, widget)
      @controller.instance_variable_set(:@sb, {})
      @controller.instance_variable_set(:@edit, :new => {:options => {}})
      widget.title = 'foo'
      controller.send(:widget_validate_entries)
      expect(flash_array).not_to be_empty
    end
  end
end

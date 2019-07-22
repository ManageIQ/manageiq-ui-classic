describe OpsController do
  let(:params) { {} }
  let(:session) { {} }
  let(:schedule) { FactoryBot.create(:miq_automate_schedule) }
  let(:schedule_new) { MiqSchedule.new }
  let(:user) { stub_user(:features => :all) }

  include_context "valid session"

  before do
    EvmSpecHelper.local_miq_server
    stub_user(:features => :all)
  end

  describe "#prebuild_automate_schedule" do
    include OpsController::Settings::AutomateSchedules
    let(:ops) { OpsController.new }

    before do
      session = instance_double('ApplicationController', :session => {:userid => user.userid})
      ops.instance_variable_set(:@current_user, user)
      ops.instance_variable_set(:@_request, session)
    end

    it "prebuilds the framework for the filter attribute of an MiqSchedule" do
      dummy_schedule = MiqSchedule.new
      prebuilt_framework = ops.prebuild_automate_schedule(dummy_schedule)
      expect(dummy_schedule[:ui]).to be_nil
      expect(prebuilt_framework[:ui][:ui_attrs]).to be_a Array
      expect(prebuilt_framework[:ui][:ui_attrs]).to be_empty
      expect(prebuilt_framework[:ui][:ui_object]).to be_empty
      expect(prebuilt_framework[:ui][:ui_object]).to be_a Hash
    end
  end

  describe "#schedule_set_record_vars" do
    context "set object_request as parameters[:request]" do
      it "has a nil request for a new automate schedule" do
        params[:id] = "new"
        post :automate_schedules_set_vars, :params => params, :session => session

        json = JSON.parse(response.body)
        expect(json["object_request"]).to eq ""
      end

      it "has the correct request when looking up an existing automation schedule" do
        params[:id] = schedule.id
        post :automate_schedules_set_vars, :params => params, :session => session

        json = JSON.parse(response.body)
        expect(schedule.filter[:parameters]['request']).to eq "test_request"
        expect(schedule.filter[:parameters]['key1']).to eq 'value1'
        expect(schedule.filter[:ui][:ui_object]).to be_a Hash
        expect(schedule.filter[:ui][:ui_attrs]).to be_a Array
        expect(json['ui_attrs']).to eq [[], [], [], [], []]
        expect(json["object_request"]).to eq "test_request"
      end
    end
  end

  describe "#fetch_target_ids" do
    include OpsController::Settings::AutomateSchedules
    let(:ops) { OpsController.new }

    before do
      ops.params = {}
    end

    [nil, 'null'].each do |target|
      it "skips Rbac if :target_class is #{target}" do
        ops.params = {:target_class => target }
        expect(ops).to receive(:render).once
        expect(Rbac).to receive(:filtered).never
        ops.fetch_target_ids
      end
    end

    context 'setting targets' do
      before do
        allow(ops).to receive(:render)
        ops.params = {:target_class => 'some_class'}
      end

      it 'calls targets_from_class to set appropriate targets' do
        expect(ops).to receive(:targets_from_class).with('some_class')
        ops.fetch_target_ids
      end
    end
  end

  describe "#fetch_automate_request_vars" do
    include OpsController::Settings::AutomateSchedules
    let(:ops) { OpsController.new }

    before do
      session = instance_double('ApplicationController', :session => {:userid => user.userid})
      ops.instance_variable_set(:@current_user, user)
      ops.instance_variable_set(:@_request, session)
    end

    it "transposes filter[:parameters][:request] to :object_request" do
      automate_request = ops.fetch_automate_request_vars(schedule)
      expect(schedule.filter[:parameters][:request]).to eq "test_request"
      expect(automate_request[:object_request]).to eq "test_request"
    end

    it "saves ui attrs under the :ui key" do
      schedule.filter[:ui][:ui_attrs] = [%w(key1 value1), %w(key2 value2)]
      schedule.save
      automate_request = ops.fetch_automate_request_vars(schedule)
      expect(automate_request[:ui_attrs]).to eq [%w(key1 value1), %w(key2 value2), [], [], [], [], []]
    end

    it "instantiates an empty hash for a new schedule" do
      automate_request = ops.fetch_automate_request_vars(schedule_new)
      expect(schedule_new.filter).to be_nil
      expect(automate_request[:object_request]).to eq ""
    end

    context 'setting targets' do
      let(:schedule) { MiqSchedule.new(:filter => {:parameters => {}, :ui => {:ui_object => {:target_class => 'some_class'}}, :uri_parts => {}}) }

      it 'calls targets_from_class to set appropriate targets' do
        expect(ops).to receive(:targets_from_class).with('some_class')
        ops.fetch_automate_request_vars(schedule)
      end
    end
  end

  describe '#targets_from_class' do
    include OpsController::Settings::AutomateSchedules
    let(:ops) { OpsController.new }

    ['MiqGroup', 'User', 'Tenant'].each do |klass|
      context "#{klass} class" do
        it 'sets targets according to the target class' do
          targets = klass.safe_constantize.all.sort_by { |t| t.name.downcase }.collect { |t| [t.name, t.id.to_s] }
          expect(ops.targets_from_class(klass)).to eq(targets)
        end
      end
    end
  end
end

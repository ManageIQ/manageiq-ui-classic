require "spec_helper"

describe MiqTaskController do
  context "#tasks_condition" do
    let(:user) { FactoryBot.create(:user) }
    subject { controller.send(:tasks_condition, @opts) }
    before do
      allow(controller).to receive_messages(:session => user)
    end

    describe "My Tasks (used to be 'VM and Container Analysis Tasks' - specific to Jobs)" do
      before do
        controller.instance_variable_set(:@tabform, "tasks_1")
        @opts = {:ok           => true,
                 :queued       => true,
                 :error        => true,
                 :warn         => true,
                 :running      => true,
                 :state_choice => "all",
                 :time_period  => 0,
                 :states       => MiqTaskController::TASK_STATES}
      end

      it "all defaults" do
        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=?"
        expected = [query,
                    user.userid,
                    "Waiting_to_start", "Queued",
                    "Finished", "Ok",
                    "Finished", "Error",
                    "Finished", "Warn",
                    "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period])
        expect(subject).to eq(expected)
      end

      it "Zone: default, Time period: 1 Day Ago, status:  Ok, State:  Finished" do
        set_opts(:queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Finished",
                 :zone         => "default",
                 :time_period  => 1)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? AND miq_tasks.status=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=? AND " \
                "miq_tasks.state=?"
        expected = [query,
                    user.userid,
                    "Finished", "Ok"]
        expected += get_time_period(@opts[:time_period]) << "default" << "Finished"
        expect(subject).to eq(expected)
      end

      it "zone: default, Time period: 6 Days Ago, status: Error and Warn, State: All " do
        set_opts(:ok          => nil,
                 :queued      => nil,
                 :error       => "1",
                 :warn        => "1",
                 :running     => nil,
                 :zone        => "default",
                 :time_period => 6)

        query = "miq_tasks.userid=? AND (" \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=?"
        expected = [query,
                    user.userid,
                    "Finished", "Error",
                    "Finished", "Warn"]
        expected += get_time_period(@opts[:time_period]) << "default"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: Last 24, Status: Queued, Running, Ok, Error and Warn, State: Aborting" do
        set_opts(:state_choice => "Aborting")

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query,
                    user.userid,
                    "Waiting_to_start", "Queued",
                    "Finished", "Ok",
                    "Finished", "Error",
                    "Finished", "Warn",
                    "Finished", "Waiting_to_start", "Queued"]

        expected += get_time_period(@opts[:time_period]) << "Aborting"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: Last 24, Status: none, State: All" do
        set_opts(:ok      => nil,
                 :queued  => nil,
                 :error   => nil,
                 :warn    => nil,
                 :running => nil)

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=?"

        expected = [query,
                    user.userid,
                    "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]

        expected += get_time_period(@opts[:time_period])
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: Last 24, Status: none, State: Aborting" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Aborting")

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) " \
                "AND miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"

        expected = [query, user.userid, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Aborting"
        expect(subject).to eq(expected)
      end

      it "zone: default, Time period: 1 Day Ago, Status: none, State: Waiting to Start" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Waiting_to_start",
                 :zone         => "default",
                 :time_period  => 1)

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "default" << "Waiting_to_start"
        expect(subject).to eq(expected)
      end

      it "zone: default, Time period: 4 Days Ago, Status: Queued and Running, State: Synchronizing" do
        set_opts(:ok           => nil,
                 :queued       => "1",
                 :error        => nil,
                 :warn         => nil,
                 :running      => "1",
                 :state_choice => "Synchronizing",
                 :zone         => "default",
                 :time_period  => 4)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Waiting_to_start", "Queued", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "default" << "Synchronizing"
        expect(subject).to eq(expected)
      end

      it "zone: default, Time period: 4 Days Ago, Status: Queued and Running, State: Snapshot Delete" do
        set_opts(:ok           => nil,
                 :queued       => "1",
                 :error        => nil,
                 :warn         => nil,
                 :running      => "1",
                 :state_choice => "Snapshot_delete",
                 :zone         => "default",
                 :time_period  => 4)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Waiting_to_start", "Queued", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "default" << "Snapshot_delete"
        expect(subject).to eq(expected)
      end
    end

    describe "My Other UI Tasks" do
      before do
        controller.instance_variable_set(:@tabform, "tasks_1")
        @opts = {:ok           => true,
                 :queued       => true,
                 :error        => true,
                 :warn         => true,
                 :running      => true,
                 :state_choice => "all",
                 :time_period  => 0,
                 :states       => MiqTaskController::TASK_STATES}
      end

      it "all defaults" do
        query = 'miq_tasks.userid=? AND (' \
                '(miq_tasks.state=? OR miq_tasks.state=?) OR ' \
                '(miq_tasks.state=? AND miq_tasks.status=?) OR ' \
                '(miq_tasks.state=? AND miq_tasks.status=?) OR ' \
                '(miq_tasks.state=? AND miq_tasks.status=?) OR ' \
                '(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND ' \
                'miq_tasks.updated_on>=? AND ' \
                'miq_tasks.updated_on<=?'
        expected = [query, user.userid, "Waiting_to_start", "Queued", "Finished", "Ok",
                    "Finished", "Error", "Finished", "Warn", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period])
        expect(subject).to eq(expected)
      end

      it "Time period: 6 Days ago, status: queued and running, state: initialized" do
        set_opts(:ok           => nil,
                 :error        => nil,
                 :warn         => nil,
                 :state_choice => "Initialized",
                 :time_period  => 6)

        query = "miq_tasks.userid=? AND (" \
                "(miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Waiting_to_start", "Queued", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Initialized"
        expect(subject).to eq(expected)
      end

      it "Time period: 6 Days Ago, status: queued and running, state: active" do
        set_opts(:ok           => nil,
                 :error        => nil,
                 :warn         => nil,
                 :state_choice => "Active",
                 :time_period  => 6)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Waiting_to_start", "Queued", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Active"
        expect(subject).to eq(expected)
      end

      it "Time period: 6 Days Ago, status: queued and running, state: finished" do
        set_opts(:ok => nil, :error => nil, :warn => nil, :state_choice => "Finished", :time_period => 6)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Waiting_to_start", "Queued", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Finished"
        expect(subject).to eq(expected)
      end

      it "Time period: 6 Days Ago, status: ok, state: queued" do
        set_opts(:ok           => "1",
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Queued",
                 :time_period  => 6)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? AND miq_tasks.status=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"

        expected = [query, user.userid, "Finished", "Ok"]
        expected += get_time_period(@opts[:time_period]) << "Queued"
        expect(subject).to eq(expected)
      end

      it "Time period: 6 Days Ago, status: ok and warn, state: queued" do
        set_opts(:ok           => "1",
                 :queued       => nil,
                 :error        => nil,
                 :warn         => "1",
                 :running      => nil,
                 :state_choice => "Queued",
                 :time_period  => 6)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Finished", "Ok", "Finished", "Warn"]
        expected += get_time_period(@opts[:time_period]) << "Queued"
        expect(subject).to eq(expected)
      end

      it "Time period: 6 Days Ago, status: ok and warn and error, state: queued" do
        set_opts(:ok           => "1",
                 :queued       => nil,
                 :error        => "1",
                 :warn         => "1",
                 :running      => nil,
                 :state_choice => "Queued",
                 :time_period  => 6)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Finished", "Ok", "Finished", "Error", "Finished", "Warn"]
        expected += get_time_period(@opts[:time_period]) << "Queued"
        expect(subject).to eq(expected)
      end

      it "Time Period: Last 24, Status: none checked, State: All" do
        set_opts(:ok => nil, :queued => nil, :error => nil, :warn => nil, :running => nil)

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND " \
                "miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=?"
        expected = [query, user.userid, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period])
        expect(subject).to eq(expected)
      end

      it "Time Period: Last 24, Status: none checked, State: Active" do
        set_opts(:ok => nil, :queued => nil, :error => nil, :warn => nil, :running => nil, :state_choice => "Active")

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND " \
                "miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Active"
        expect(subject).to eq(expected)
      end

      it "Time Period: 1 Day Ago, Status: none checked, State: Finished" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Finished",
                 :time_period  => 1)

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND " \
                "miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Finished"
        expect(subject).to eq(expected)
      end

      it "Time Period: 2 Day Ago, Status: none checked, State: Initialized" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Initialized",
                 :time_period  => 2)

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND " \
                "miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Initialized"
        expect(subject).to eq(expected)
      end

      it "Time Period: 3 Day Ago, Status: none checked, State: Queued" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Queued",
                 :time_period  => 3)

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND " \
                "miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, user.userid, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Queued"
        expect(subject).to eq(expected)
      end
    end

    describe "All Tasks (used to be 'All VM and Container Analysis Tasks' - specific to Jobs)" do
      before do
        controller.instance_variable_set(:@tabform, "tasks_2")
        @opts = {:ok           => true,
                 :queued       => true,
                 :error        => true,
                 :warn         => true,
                 :running      => true,
                 :state_choice => "all",
                 :zone         => "<all>",
                 :user_choice  => "all",
                 :time_period  => 0,
                 :states       => MiqTaskController::TASK_STATES}
      end

      it "all defaults" do
        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Ok", "Finished", "Error",
                    "Finished", "Warn", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period])
        expect(subject).to eq(expected)
      end

      it "zone: default, user: all, Time  period: 6 Days Ago, status: queued and running, state: all" do
        set_opts(:ok => nil, :queued => "1", :error => nil, :warn => nil, :zone => "default", :time_period => 6)

        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "default"
        expect(subject).to eq(expected)
      end

      it "zone: default, user: all, Time period: 6 Days Ago, status: queued and running, state: snapshot create" do
        set_opts(:ok           => nil,
                 :queued       => "1",
                 :error        => nil,
                 :warn         => nil,
                 :state_choice => "Snapshot_create",
                 :zone         => "default",
                 :time_period  => 6)

        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "default" << "Snapshot_create"
        expect(subject).to eq(expected)
      end

      it "zone: default, user: all, Time period: 6 Days Ago, status: queued and running and ok, state: snapshot create" do
        set_opts(:ok           => "1",
                 :queued       => "1",
                 :error        => nil,
                 :warn         => nil,
                 :state_choice => "Snapshot_create",
                 :zone         => "default",
                 :time_period  => 6)

        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.zone=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Ok",
                    "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "default" << "Snapshot_create"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: Last 24, Status: none checked, State: Snapshot Create" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Snapshot_create")

        query = "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Snapshot_create"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: 2 Days Ago, Status: none checked, State: Scanning" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Scanning",
                 :time_period  => 2)

        query = "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Scanning"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: 3 Days Ago, Status: none checked, State: Initializing" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Initializing",
                 :time_period  => 3)

        query = "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Initializing"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: 4 Days Ago, Status: none checked, State: Finished" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Finished",
                 :time_period  => 4)

        query = "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Finished"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: 5 Days Ago, Status: none checked, State: Deploy Smartproxy" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Deploy_smartproxy",
                 :time_period  => 5)

        query = "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Deploy_smartproxy"
        expect(subject).to eq(expected)
      end

      it "zone: <All Zones>, Time period: 6 Days Ago, Status: Ok, Error and Warn, State: Cancelling" do
        set_opts(:ok           => "1",
                 :queued       => nil,
                 :error        => "1",
                 :warn         => "1",
                 :running      => nil,
                 :state_choice => "Cancelling",
                 :time_period  => 6)

        query = "((miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Finished", "Ok", "Finished", "Error", "Finished", "Warn"]
        expected += get_time_period(@opts[:time_period]) << "Cancelling"
        expect(subject).to eq(expected)
      end
    end

    describe "All Tasks (used to be 'All Other Tasks' - specific to Tasks)" do
      before do
        controller.instance_variable_set(:@tabform, "tasks_2")
        @opts = {:ok           => true,
                 :queued       => true,
                 :error        => true,
                 :warn         => true,
                 :running      => true,
                 :state_choice => "all",
                 :user_choice  => "all",
                 :time_period  => 0,
                 :states       => MiqTaskController::TASK_STATES}
      end

      it "all defaults" do
        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Ok", "Finished", "Error",
                    "Finished", "Warn", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period])
        expect(subject).to eq(expected)
      end

      it "user: all, Time period: 1 Day Ago, status: queued, running, ok, error and warn, state: active" do
        set_opts(:state_choice => "Active", :time_period => 1)

        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Ok", "Finished", "Error",
                    "Finished", "Warn", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Active"
        expect(subject).to eq(expected)
      end

      it "user: all, Time period: 1 Day Ago, status: queued, running, ok, error and warn, state: finished" do
        set_opts(:state_choice => "Finished", :time_period => 1)

        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Ok", "Finished", "Error",
                    "Finished", "Warn", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Finished"
        expect(subject).to eq(expected)
      end

      it "user: all, Time period: 1 Day Ago, status: queued, running, ok, error and warn, state: initialized" do
        set_opts(:state_choice => "Initialized", :time_period => 1)

        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND miq_tasks.state=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Ok", "Finished", "Error",
                    "Finished", "Warn", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Initialized"
        expect(subject).to eq(expected)
      end

      it "user: all, Time period: 1 Day Ago, status: queued, running, ok, error and warn, state: queued" do
        set_opts(:state_choice => "Queued", :time_period => 1)

        query = "((miq_tasks.state=? OR miq_tasks.state=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state=? AND miq_tasks.status=?) OR " \
                "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "Waiting_to_start", "Queued", "Finished", "Ok", "Finished", "Error",
                    "Finished", "Warn", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Queued"
        expect(subject).to eq(expected)
      end

      it "User: All Users, Time Period: Last 24, Status: none checked, State: All" do
        set_opts(:ok => nil, :queued => nil, :error => nil, :warn => nil, :running => nil)

        query = "(miq_tasks.status!=? AND miq_tasks.status!=? AND " \
                "miq_tasks.status!=? AND miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=?"
        expected = [query, "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period])
        expect(subject).to eq(expected)
      end

      it "User: system, Time Period: 1 Day Ago, Status: none checked, State: Active" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Active",
                 :user_choice  => "system",
                 :time_period  => 1)

        query = "miq_tasks.userid=? AND " \
                "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND " \
                "miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "system", "Ok", "Error", "Warn", "Finished", "Queued", "Waiting_to_start"]
        expected += get_time_period(@opts[:time_period]) << "Active"
        expect(subject).to eq(expected)
      end

      it "User: system, Time Period: 2 Day Ago, Status: Queued, State: Finished" do
        set_opts(:ok           => nil,
                 :queued       => "1",
                 :error        => nil,
                 :warn         => nil,
                 :running      => nil,
                 :state_choice => "Finished",
                 :user_choice  => "system",
                 :time_period  => 2)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state=? OR miq_tasks.state=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "system", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Finished"
        expect(subject).to eq(expected)
      end

      it "User: system, Time Period: 3 Day Ago, Status: Running, State: Initialized" do
        set_opts(:ok           => nil,
                 :queued       => nil,
                 :error        => nil,
                 :warn         => nil,
                 :running      => "1",
                 :state_choice => "Initialized",
                 :user_choice  => "system",
                 :time_period  => 3)

        query = "miq_tasks.userid=? AND " \
                "((miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)) AND " \
                "miq_tasks.updated_on>=? AND " \
                "miq_tasks.updated_on<=? AND " \
                "miq_tasks.state=?"
        expected = [query, "system", "Finished", "Waiting_to_start", "Queued"]
        expected += get_time_period(@opts[:time_period]) << "Initialized"
        expect(subject).to eq(expected)
      end
    end

    describe "building tabs" do
      before do
        controller.instance_variable_set(:@tabform, "ui_2")
        controller.instance_variable_set(:@settings, :perpage => {})
        allow(controller).to receive(:role_allows?).and_return(true)
      end

      it 'sets the available tabs' do
        controller.build_jobs_tab
        expect(assigns(:tabs)).to eq([
                                       ["1", "My Tasks"],
                                       ["2", "All Tasks"],
                                     ])
      end
    end

    describe "#list_jobs" do
      it 'sets the active tab' do
        controller.instance_variable_set(:@tabform, "ui_2")
        controller.instance_variable_set(:@tasks_options, {})
        allow(controller).to receive(:tasks_scopes)
        allow(controller).to receive(:get_view)
        controller.list_jobs
        expect(assigns(:active_tab)).to eq("2")
      end
    end

    describe ".cancel_task" do
      before do
        allow(controller).to receive(:jobs_info)
        allow(controller).to receive(:role_allows?).and_return(true)

        task = double("MiqTask")
        allow(MiqTask).to receive(:find_by).and_return(task)
        allow(task).to receive(:state).and_return("starting")
        allow(task).to receive(:process_cancel).and_raise("Not Permitted Signal")
      end

      it "does not raise error if not alowed signal sent" do
        expect { controller.cancel_task }.not_to raise_error
      end
    end

    def get_time_period(period)
      t = format_timezone(period.to_i != 0 ? period.days.ago : Time.zone.now, Time.zone, "raw")
      ret = []
      ret << t.beginning_of_day << t.end_of_day
    end

    def set_opts(hsh)
      hsh.each_pair { |k, v| @opts[k] = v }
    end
  end
end

describe MiqRequestController do
  context "#post_install_callback should render nothing" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it "when called with a task id" do
      expect(MiqRequestTask).to receive(:post_install_callback).with("12345").once
      get 'post_install_callback', :params => { :task_id => 12345 }
      expect(response.body).to be_blank
    end

    it "when called without a task id" do
      expect(MiqRequestTask).not_to receive(:post_install_callback)
      get 'post_install_callback'
      expect(response.body).to be_blank
    end
  end

  let(:parent_tenant)      { FactoryBot.create(:tenant) }
  let(:child_tenant)       { FactoryBot.create(:tenant, :parent=> parent_tenant) }
  let(:user_child_tenant)  { FactoryBot.create(:user_with_group, :tenant => child_tenant) }
  let(:user_parent_tenant) { FactoryBot.create(:user_with_group, :tenant => parent_tenant) }

  let(:template)     { FactoryBot.create(:template_amazon) }
  let(:request_body) { {:requester => user_child_tenant, :source_type => 'VmOrTemplate', :source_id => template.id} }

  describe "#get_view" do
    before do
      EvmSpecHelper.local_miq_server

      login_as user_child_tenant
      FactoryBot.create(:miq_provision_request, request_body)
    end

    it "displays miq_request for parent_tenant, when request was added by child_parent" do
      login_as user_parent_tenant
      controller.instance_variable_set(:@settings, {})
      allow_any_instance_of(MiqRequestController).to receive(:fileicon)
      controller.instance_variable_set(:@in_report_data, true)
      view, _pages = controller.send(:get_view, MiqRequest, {}, true)
      expect(view.table.data.count).to eq(1)
    end
  end

  describe "#prov_scope" do
    let(:user) { FactoryBot.create(:user_miq_request_approver, :userid => "Approver") }
    let(:options) { {} }
    subject { controller.send(:prov_scope, options) }
    before { login_as user }

    context "created_on" do
      let(:options) do
        { :time_period => 9 }
      end
      it { is_expected.to include [:created_recently, 9] }
    end

    context "requester_id" do
      context "logged as an approver" do
        it { is_expected.not_to include [:with_requester, user.id] }
      end
      context "logged without approval privileges" do
        let(:user) { FactoryBot.create(:user, :features => "none") }
        it { is_expected.to include [:with_requester, user.id] }
      end
      context "selected 'another_user'" do
        let(:another_user) { FactoryBot.create(:user) }
        let(:options) do
          { :user_choice => another_user.id }
        end
        it { is_expected.to include [:with_requester, another_user.id] }
      end
      context "selected 'all'" do
        let(:options) do
          { :user_choice => 'all' }
        end
        it { expect(subject.collect(&:first)).not_to include :with_requester }
      end
    end

    context "approval_state" do
      let(:options) do
        { :applied_states => %w(state_1 state_2) }
      end
      it { is_expected.to include [:with_approval_state, %w(state_1 state_2)] }
    end

    context "type" do
      it { is_expected.to include [:with_type, MiqRequest::MODEL_REQUEST_TYPES[:Service].keys.collect(&:to_sym)] }
    end

    context "request_type" do
      context "selected '1'" do
        let(:options) do
          { :type_choice => "1" }
        end
        it { is_expected.to include [:with_request_type, "1"] }
      end
      context "selected 'all'" do
        let(:options) do
          { :type_choice => "all" }
        end
        it { is_expected.not_to include [:with_request_type, "all"] }
      end
    end

    context "reason" do
      %w(*starts_with *includes* ends_with*).each do |pattern|
        context "is matched to '#{pattern}'" do
          let(:options) do
            { :reason_text => pattern }
          end
          it { is_expected.to include [:with_reason_like, pattern] }
        end
      end
    end

    context "empty options hash" do
      it { expect(subject.collect(&:first)).to contain_exactly :with_type }
    end
  end

  context "#button" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @miq_request = MiqProvisionConfiguredSystemRequest.create(:description    => "Foreman provision",
                                                                :approval_state => "pending_approval",
                                                                :requester      => User.current_user)
    end
    it "when edit request button is pressed" do
      post :button, :params => { :pressed => "miq_request_edit", :id => @miq_request.id, :format => :js }
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end

    it "when copy request button is pressed" do
      post :button, :params => { :pressed => "miq_request_copy", :id => @miq_request.id, :format => :js }
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end
  end

  render_views

  describe '#show_list' do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it 'renders GTL with MiqRequest model' do
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name      => 'MiqRequest',
        :gtl_type_string => 'list',
      )
      get :show_list
    end
  end

  describe '#report_data' do
    let(:user1) { FactoryBot.create(:user) }
    let(:user2) { create_user_in_other_region(user1.userid) }
    let(:miq_request1) do
      FactoryBot.create(:miq_provision_request, :with_approval,
                         :source_type    => 'VmOrTemplate',
                         :source_id      => template.id,
                         :created_on     => 2.days.ago,
                         :requester      => user1,
                         :approval_state => "denied",
                         :request_type   => "template",
                         :reason         => "abcdef")
    end
    let(:miq_request2) do
      FactoryBot.create(:miq_provision_request, :with_approval,
                         :source_type    => 'VmOrTemplate',
                         :source_id      => template.id,
                         :created_on     => 10.days.ago,
                         :requester      => FactoryBot.create(:user),
                         :approval_state => "approved",
                         :request_type   => "clone_to_vm",
                         :reason         => "abc")
    end
    let(:miq_request3) do
      FactoryBot.create(:miq_provision_request, :with_approval,
                         :source_type    => 'VmOrTemplate',
                         :source_id      => template.id,
                         :created_on     => 45.days.ago,
                         :requester      => user2,
                         :approval_state => "pending_approval",
                         :request_type   => "clone_to_template",
                         :reason         => "cdef")
    end

    subject do
      report_data_request(:model       => 'MiqRequest',
                          :named_scope => scope)

      result = assert_report_data_response
      result['data']['rows'].length
    end

    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone

      miq_request1
      miq_request2
      miq_request3
    end

    context 'filters by created_on' do
      let(:scope) { [[:created_recently, 14]] }
      it { is_expected.to eq(2) }
    end

    context 'filters by requester_id' do
      let(:scope) { [[:with_requester, user1.id]] }
      it { is_expected.to eq(2) }
    end

    context 'filters by approval_state' do
      let(:scope) { [[:with_approval_state, %w(approved pending_approval)]] }
      it { is_expected.to eq(2) }
    end

    context 'filters by request_type' do
      let(:scope) { [[:with_request_type, %w(clone_to_vm clone_to_template)]] }
      it { is_expected.to eq(2) }
    end

    context 'filters by reason' do
      %w(*cd cd* *cde*).each do |reason|
        context "'#{reason}'" do
          let(:scope) { [[:with_reason_like, reason]] }
          it { is_expected.to eq(2) }
        end
      end
    end
  end

  context 'showing details of a VM reconfigure task' do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    let(:vm) { FactoryBot.create(:vm) }
    let!(:other_vm) { FactoryBot.create(:vm) }

    let(:reconfigure_request) do
      FactoryBot.create(:vm_reconfigure_request, :options => {:src_ids => [vm.id]})
    end

    # http://localhost:3000/miq_request/show/10000000000342
    it 'shows a grid with affected VMs' do
      expect(controller).to receive(:prov_set_show_vars).once.and_call_original
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name       => 'Vm',
        :gtl_type_string  => 'list',
        :selected_records => [vm.id] # vm.id is here, other_vm.id is not
      )
      get :show, :params => {:id => reconfigure_request.id}
      expect(response.status).to eq(200)
    end
  end

  context 'showing details of a retirement task' do
    before do
      @user = stub_admin
      EvmSpecHelper.create_guid_miq_server_zone
    end

    let(:vm1)     { FactoryBot.create(:vm_cloud) }
    let(:vm2)     { FactoryBot.create(:vm_cloud) } # not part of the stack
    let(:stack)   { FactoryBot.create(:orchestration_stack).tap { |stack| stack.direct_vms = [vm1] } }
    let(:service) { FactoryBot.create(:service_orchestration).tap { |service| service.add_resource!(stack) } }
    let(:request) do
      FactoryBot.create(:service_retire_request,
                         :type      => 'ServiceRetireRequest',
                         :requester => @user,
                         :options   => {:src_ids => [service.id]})
    end
    # let(:request) { FactoryBot.create(:miq_service_retirement_request, :options => {:src_ids => [service.id]}) }

    let(:payload) { { :model_name => 'Vm', :parent_id => service.id.to_s, additional_key => additional_val } }
    let(:additional_val) do
      {
        :model             => 'Vm',
        :parent_id         => service.id.to_s,
        :parent_class_name => 'ServiceOrchestration',
        :view_suffix       => 'OrchestrationStackRetireRequest',
        :display           => 'main',
        :gtl_type          => 'list'
      }
    end

    context 'angular for grid with affected VMs is properly initialized' do
      let(:additional_key) { :report_data_additional_options }
      it do
        expect(controller).to receive(:prov_set_show_vars).once.and_call_original

        # Verify Rails correctly initializes Angular which will then perform POST /report_data to fetch the VMs.
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(**payload)

        get :show, :params => {:id => request.id}
        expect(response.status).to eq(200)
      end
    end

    context 'angular for grid with affected VMs gets the correct VMs with XHR call' do
      let(:additional_key) { :additional_options }
      it do
        post :report_data, :params => payload
        expect(response.status).to eq(200)

        # Verify Angular got correct VMs when sending the payload as set by previous test.
        expect(JSON.parse(response.body).dig('data', 'rows').map { |row| row['id'] }).to eq([vm1.id.to_s])
      end
    end
  end

  context "#edit_button" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @miq_request = MiqProvisionConfiguredSystemRequest.create(:description    => "Foreman provision",
                                                                :approval_state => "pending_approval",
                                                                :requester      => User.current_user)
    end
    it "when the edit button is pressed the request is displayed" do
      session[:settings] = {:display => {:quad_truncate => 'f'}}
      get :show, :params => { :id => @miq_request.id }
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end
  end

  context "#layout_from_tab_name" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      session[:settings] = {:display => {:quad_truncate => 'f'},
                            :views   => {:miq_request => 'grid'}}
    end

    it "miq_request/show_list sets @layout='miq_request_vm' when redirected via foreman provisioning" do
      post :show_list, :params => { :typ => "configured_systems" }
      layout = controller.instance_variable_get(:@layout)
      expect(layout).to eq("miq_request_vm")
    end
  end

  context '#filter' do
    before { stub_user(:features => :all) }

    it 'returns a scope for the GTL' do
      post :filter, :params => {:reasonText => 'foobar', :selectedPeriod => 7}
      expect(response.status).to eq(200)
      scope = JSON.parse(response.body)['data']['scope']
      expect(scope).to match(array_including(['created_recently', 7], %w(with_reason_like foobar)))
    end
  end

  context '#miq_request_initial_options' do
    before { stub_user(:features => :all) }
    subject { controller.send(:miq_request_initial_options) }

    it 'has values for states, users, types and time periods' do
      expect(subject).to match(
        hash_including(
          :states         => array_including(hash_including(:label => 'Pending Approval', :checked => true, :value => 'pending_approval')),
          :users          => array_including(hash_including(:label => 'All', :value => 'all')),
          :selectedUser   => 'all',
          :types          => array_including(hash_including(:label => 'All', :value => 'all')),
          :selectedType   => 'all',
          :timePeriods    => array_including(hash_including(:label => 'Last 24 Hours', :value => 1)),
          :selectedPeriod => 7,
          :reasonText     => nil,
        )
      )
    end
  end

  context '#miq_request_initial_options user choice' do
    before do
      EvmSpecHelper.local_miq_server
      stub_settings(:server => {}, :session => {})

      # Create users
      @admin = FactoryBot.create(:user, :role => "super_administrator")
      allow(@admin).to receive(:role_allows?).with(:identifier => 'miq_request_approval').and_return(true)
      @vm_user = FactoryBot.create(:user, :role => "vm_user")
      @desktop = FactoryBot.create(:user, :role => "desktop")
      @approver = FactoryBot.create(:user, :role => "approver")
      allow(@approver).to receive(:role_allows?).with(:identifier => 'miq_request_approval').and_return(true)
      @users = [@admin, @vm_user, @desktop, @approver]

      # Create requests
      FactoryBot.create(:vm_migrate_request, :requester => @admin)
      FactoryBot.create(:vm_migrate_request, :requester => @vm_user)
      FactoryBot.create(:vm_migrate_request, :requester => @desktop)
      FactoryBot.create(:vm_migrate_request, :requester => @approver)
    end

    subject { controller.send(:miq_request_initial_options) }

    it 'multiple users are present for admin' do
      login_as(@admin)
      expect(subject[:users].length).to be > 1
    end

    it 'multiple users are present for approver' do
      login_as(@approver)
      expect(subject[:users].length).to be > 1
    end

    it 'just the vm_user is present for vm_user' do
      login_as(@vm_user)
      expect(subject[:users].length).to eq(1)
      expect(subject[:selectedUser]).to eq(@vm_user.id)
    end
  end

  context "requester_label" do
    before do
      EvmSpecHelper.local_miq_server
      stub_settings(:server => {}, :session => {})

      # Create user
      @approver = FactoryBot.create(:user, :role => "approver")
      allow(@approver).to receive(:role_allows?).with(:identifier => 'miq_request_approval').and_return(true)

      # Create request
      @request = FactoryBot.create(:vm_migrate_request, :requester => @approver)
    end

    it "returns label with requester_name" do
      label = controller.send(:requester_label, @request)
      expect(label).to eq(@approver.name)
    end

    it "returns label when requester no longer exists" do
      @request.update_attributes(:requester => nil)
      label = controller.send(:requester_label, @request)
      expect(label).to eq("#{@approver.name} (no longer exists)")
    end
  end

  private

  def create_user_in_other_region(userid)
    other_region_id = ApplicationRecord.id_in_region(1, MiqRegion.my_region_number + 1)
    FactoryBot.create(:user, :id => other_region_id).tap do |u|
      u.update_column(:userid, userid) # Bypass validation for test purposes
    end
  end

  def requestor_expression_for_two_users(user1, user2)
    [{"=" => {"value" => user1.id, "field" => "MiqRequest-requester_id"}},
     {"=" => {"value" => user2.id, "field" => "MiqRequest-requester_id"}}]
  end
end

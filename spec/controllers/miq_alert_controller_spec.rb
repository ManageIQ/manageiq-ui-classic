describe MiqAlertController do
  before { stub_user(:features => :all) }

  describe "#show_list" do
    render_views

    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end

  describe "#edit" do
    before do
      login_as user_with_feature(%w[miq_alert miq_alert_edit miq_alert_set_view])
      @miq_alert = FactoryBot.create(:miq_alert)
      controller.instance_variable_set(:@lastaction, "show")
    end

    it "first time in" do
      controller.edit
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    describe "#alert_build_edit_screen" do
      it "it should skip id when copying all attributes of an existing alert" do
        controller.params = {:id => @miq_alert.id, :action => "copy"}
        controller.send(:alert_build_edit_screen)
        expect(assigns(:alert).id).to eq(nil)
      end

      it "it should select correct record when editing an existing alert" do
        controller.params = {:id => @miq_alert.id}
        controller.send(:alert_build_edit_screen)
        expect(assigns(:alert).id).to eq(@miq_alert.id)
      end
    end

    describe "#alert_field_changed" do
      before do
        controller.params = {:id => 0, :exp_name => ""}
        session[:edit] = {:key => "miq_alert_edit__0", :new => {}}
        allow(controller).to receive(:send_button_changes).and_return(nil)
        allow(controller).to receive(:build_snmp_options).and_return(nil)
      end

      it "does not reset repeat_time for most inputs" do
        expect(controller).to receive(:apply_default_repeat_time?).and_call_original
        expect(controller).not_to receive(:alert_default_repeat_time)
        controller.send(:alert_field_changed)
        expect(session[:edit][:new]).not_to include(:repeat_time)
      end

      it "resets repeat_time to defult for dwh events" do
        session[:edit][:new] = {:eval_method => 'dwh_generic'}
        expect(controller).to receive(:apply_default_repeat_time?).and_call_original
        expect(controller).to receive(:alert_default_repeat_time).and_call_original
        controller.send(:alert_field_changed)
        expect(session[:edit][:new]).to include(:repeat_time)
      end

      it "resets repeat_time to defult for hourly performance" do
        session[:edit][:new] = {:eval_method => 'hourly_performance'}
        expect(controller).to receive(:apply_default_repeat_time?).and_call_original
        expect(controller).to receive(:alert_default_repeat_time).and_call_original
        controller.send(:alert_field_changed)
        expect(session[:edit][:new]).to include(:repeat_time)
      end
    end

    describe "#edit" do
      it "it should correctly cancel edit screen of existing alert" do
        controller.params = {:button => "cancel", :id => @miq_alert.id}
        expect(controller).to receive(:javascript_redirect).with(:action    => 'show',
                                                                 :flash_msg => _("Edit of Alert \"%{name}\" was cancelled by the user") % {:name => @miq_alert.name},
                                                                 :id        => @miq_alert.id)
        controller.send(:edit)
      end

      it "it should correctly cancel edit screen of new alert" do
        controller.params = {:button => "cancel"}
        expect(controller).to receive(:javascript_redirect).with(:action    => 'show',
                                                                 :flash_msg => _("Add of new Alert was cancelled by the user"),
                                                                 :id        => nil)
        controller.send(:edit)
      end
    end
  end

  context 'test click on toolbar button' do
    before do
      EvmSpecHelper.local_miq_server
      login_as FactoryBot.create(:user, :features => %w[miq_alert miq_alert_edit alert_profile_assign alert_delete alert_copy alert_profile_new])
      # login_as FactoryBot.create(:user, :features => "alert_admin")
      @miq_alert = FactoryBot.create(:miq_alert)
    end

    let(:alert) { FactoryBot.create(:miq_alert, :read_only => false) }

    it "alert edit" do
      post :edit, :params => {:id => alert.id}
      expect(response.status).to eq(200)
    end

    it "alert copy" do
      post :copy, :params => {:id => alert.id}
      expect(response.status).to eq(200)
    end

    it "alert new" do
      post :new, :params => {:pressed => 'new'}
      expect(response.status).to eq(200)
    end
  end

  describe "#alert_valid_record?" do
    before do
      login_as FactoryBot.create(:user, :features => "alert_admin")
      expression = MiqExpression.new("=" => {:tag => "name", :value => "Test"}, :token => 1)
      @miq_alert = FactoryBot.create(
        :miq_alert,
        :db         => "Host",
        :options    => {:notifications => {:email => {:to => ["fred@test.com"]}}},
        :expression => expression,
        :severity   => 'info'
      )
      edit = {
        :new => {
          :name       => "New Name",
          :expression => {:eval_method => nil},
          :db         => "Host"
        }
      }
      controller.instance_variable_set(:@edit, edit)
    end

    it "forces Driving Event to be present for non-container alerts" do
      controller.send(:alert_valid_record?, @miq_alert)
      expect(assigns(:flash_array).first[:message]).to match("A Driving Event must be selected")
    end

    it "does not force Driving Event to be present for container alerts" do
      edit = {
        :new => {
          :name       => "New Name",
          :expression => {:eval_method => nil},
          :db         => "ContainerNode",
          :severity   => 'info'
        }
      }
      controller.instance_variable_set(:@edit, edit)
      controller.send(:alert_valid_record?, @miq_alert)
      expect(assigns(:flash_array)).to be_nil
    end

    it "forces Event to check to be present for eval_method - Event threshold" do
      @miq_alert = FactoryBot.create(
        :miq_alert,
        :db         => "Host",
        :options    => {:notifications => {:email => {:to => ["fred@test.com"]}}},
        :expression => {:eval_method => 'event_threshold', :mode => "internal", :options => {:event_types => []}},
        :severity   => 'info'
      )

      edit = {
        :new => {
          :expression => {:eval_method => 'event_threshold', :mode => "internal", :options => {:event_types => []}},
        }
      }
      controller.instance_variable_set(:@edit, edit)
      controller.send(:alert_valid_record?, @miq_alert)
      expect(assigns(:flash_array).first[:message]).to(match("Event to Check is required"))
    end

    it "does not force Event to check to be present for eval_method - Event threshold" do
      @miq_alert = FactoryBot.create(
        :miq_alert,
        :db         => "Host",
        :options    => {:notifications => {:email => {:to => ["fred@test.com"]}}},
        :expression => {:eval_method => 'event_threshold', :mode => "internal", :options => {:event_types => ["PowerOnVM_Task_Complete"]}},
        :severity   => 'info'
      )

      edit = {
        :new => {
          :expression => {:eval_method => 'event_threshold', :mode => "internal", :options => {:event_types => ["PowerOnVM_Task_Complete"]}},
        }
      }
      controller.instance_variable_set(:@edit, edit)
      controller.send(:alert_valid_record?, @miq_alert)
      expect(assigns(:flash_array)).to(be_nil)
    end

    context 'not choosing Send an E-mail option while adding new Alert' do
      let(:alert) do
        FactoryBot.create(:miq_alert,
                          :expression         => {:eval_method => 'nothing'},
                          :options            => {:notifications => {:delay_next_evaluation => 3600, :evm_event => {}}},
                          :responds_to_events => '_hourly_timer_',
                          :severity           => 'info')
      end
      let(:edit) { {:new => {:db => 'ContainerNode', :expression => {:eval_method => 'nothing'}}} }

      before { controller.instance_variable_set(:@edit, edit) }

      it 'returns empty flash array' do
        controller.send(:alert_valid_record?, alert)
        expect(assigns(:flash_array)).to be_nil
      end
    end
  end
end

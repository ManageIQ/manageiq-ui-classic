describe MiqPolicyController do
  context "::Alerts" do
    context "alert edit" do
      before do
        login_as user_with_feature(%w(alert alert_edit alert_profile_new))
        @miq_alert = FactoryBot.create(:miq_alert)
        controller.instance_variable_set(:@sb,
                                         :trees       => {:alert_tree => {:active_node => "al-#{@miq_alert.id}"}},
                                         :active_tree => :alert_tree)
      end

      describe "#alert_build_edit_screen" do
        it "it should skip id when copying all attributes of an existing alert" do
          controller.params = {:id => @miq_alert.id, :copy => "copy"}
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
          session[:edit] = {:key => "alert_edit__0", :new => {}}
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

      describe "#alert_edit_cancel" do
        before { allow(controller).to receive(:replace_right_cell).and_return(true) }

        it "it should correctly cancel edit screen of existing alert" do
          session[:edit] = {:alert_id => @miq_alert.id}
          controller.send(:alert_edit_cancel)
          expect(assigns(:flash_array).first[:message]).to match(/Edit of Alert \".+\" was cancelled/)
        end

        it "it should correctly cancel edit screen of new alert" do
          session[:edit] = {:alert_id => nil}
          controller.send(:alert_edit_cancel)
          expect(assigns(:flash_array).first[:message]).to include('Add of new Alert was cancelled')
        end
      end
    end

    context 'test click on toolbar button' do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryBot.create(:user, :features => %w(alert alert_edit alert_profile_assign alert_delete alert_copy alert_profile_new))
        # login_as FactoryBot.create(:user, :features => "alert_admin")
        @miq_alert = FactoryBot.create(:miq_alert)
        allow(controller).to receive(:x_active_tree).and_return(:alert_tree)
        controller.instance_variable_set(:@sb,
                                         :trees       => {:alert_tree => {:active_node => "al-#{@miq_alert.id}"}},
                                         :active_tree => :alert_tree,)
      end

      let(:alert) { FactoryBot.create(:miq_alert, :read_only => false) }

      it "alert edit" do
        post :x_button, :params => { :pressed => 'alert_edit', :id => alert.id }
        expect(response.status).to eq(200)
      end

      it "alert copy" do
        post :x_button, :params => { :pressed => 'alert_copy', :id => alert.id }
        expect(response.status).to eq(200)
      end

      it "alert new" do
        post :x_button, :params => { :pressed => 'alert_profile_new' }
        expect(response.status).to eq(200)
      end

      it "tree select" do
        post :tree_select, :params => { :id => "al-#{@miq_alert.id}" }
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => 'miq_policy/_alert_details')
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
end

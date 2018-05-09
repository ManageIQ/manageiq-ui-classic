describe OpsController do
  before(:each) do
    EvmSpecHelper.local_miq_server
    MiqRegion.seed
    MiqProductFeature.seed
    stub_admin

    controller.instance_variable_set(:@sb, {})
    allow(controller).to receive(:replace_right_cell)
    allow(controller).to receive(:load_edit).and_return(true)
    allow(controller).to receive(:render_flash)
    allow(controller).to receive(:get_node_info)
  end

  def new_user_edit(data)
    controller.rbac_user_add  # set up @edit for new user

    edit = controller.instance_variable_get(:@edit)
    edit[:new] = data
    controller.instance_variable_set(:@edit, edit)
  end

  def existing_user_edit(user, data)
    controller.instance_variable_set(:@_params, :typ => nil, :button => nil, :id => user.id)
    controller.rbac_user_edit  # set up @edit for the user

    edit = controller.instance_variable_get(:@edit)
    edit[:new] ||= {}
    edit[:new].merge!(data)
    controller.instance_variable_set(:@edit, edit)
  end

  context 'bz#1562828 - set record data before calling record.valid?' do
    let(:group) { FactoryGirl.create(:miq_group) }

    it "calls both record.valid? and rbac_user_set_record_vars or neither" do
      new_user_edit(
        :name => 'Full name',
        :userid => 'username',
        :group => group.id.to_s,
        :password => "foo",
        :verify => "bar",
      )

      user = User.new
      allow(User).to receive(:new).and_return(user)

      done_valid = false
      allow(user).to receive(:valid?) {
        done_valid = true
      }

      done_set = false
      allow(controller).to receive(:rbac_user_set_record_vars) {
        done_set = true
      }

      controller.send(:rbac_edit_save_or_add, 'user')

      expect(done_valid).to eq(done_set)
    end

    it "displays both validation failures from rails and from rbac_user_validate? at the same time" do
      new_user_edit(
        :name => '',  # fails user.valid?
        :userid => 'username',
        :group => group.id.to_s,
        :password => "foo", # fails rbac_user_validate
        :verify => "bar",
      )

      controller.send(:rbac_edit_save_or_add, 'user')

      messages = controller.instance_variable_get(:@flash_array).pluck(:message)
      expect(messages).to include(match(/password/i))
      expect(messages).to include(match(/name/i))
    end
  end

  context 'bz#1537601 - don\'t change groups on cancel' do
    let(:user) { FactoryGirl.create(:user_with_group) }
    let(:group) { FactoryGirl.create(:miq_group) }

    it "should not unset groups on cancel" do
      old_groups = user.miq_groups.pluck(:id).sort
      existing_user_edit(user, {
        :group => "",
      })

      controller.instance_variable_set(:@_params, :typ => nil, :button => 'save', :id => user.id)
      controller.send(:rbac_edit_save_or_add, 'user')

      # make sure it complains about the unset group in the first place
      messages = controller.instance_variable_get(:@flash_array).pluck(:message)
      expect(messages).to include(match(/group/i))

      # make sure the group didn't get changed
      user.reload
      expect(user.miq_groups.pluck(:id).sort).to eq(old_groups)
    end

    it "should not change groups when rails validation fails" do
      old_groups = user.miq_groups.pluck(:id).sort
      existing_user_edit(user, {
        :group => group.id.to_s,
        :name => "",  # fails record.valid?
      })

      controller.instance_variable_set(:@_params, :typ => nil, :button => 'save', :id => user.id)
      controller.send(:rbac_edit_save_or_add, 'user')

      # make sure it complains about the name
      messages = controller.instance_variable_get(:@flash_array).pluck(:message)
      expect(messages).to include(match(/name/i))

      # make sure the group didn't get changed
      user.reload
      expect(user.miq_groups.pluck(:id).sort).to eq(old_groups)
    end
  end

  context '#3767 - update record fields when editing' do
    let(:user) { FactoryGirl.create(:user_with_group) }

    it "updates record even for existing users" do
      existing_user_edit(user, {
        :name => "changed",
      })

      controller.instance_variable_set(:@_params, :typ => nil, :button => 'save', :id => user.id)
      controller.send(:rbac_edit_save_or_add, 'user')

      # make sure it returned success
      messages = controller.instance_variable_get(:@flash_array).pluck(:message)
      expect(messages).to include(match(/was saved/i))

      # make sure the name did get changed
      user.reload
      expect(user.name).to eq('changed')
    end
  end

  context 'bz#1574634 - set current_group' do
    let(:user) { FactoryGirl.create(:user_with_group) }
    let(:group) { FactoryGirl.create(:miq_group) }

    pending "should set current_group for new item" do
      new_user_edit(
        :name => 'Full name',
        :userid => 'username',
        :group => group.id.to_s,
        :password => "foo",
        :verify => "foo",
      )

      controller.instance_variable_set(:@_params, :typ => nil, :button => 'save', :id => user.id)
      controller.send(:rbac_edit_save_or_add, 'user')

      # make sure it returned success
      messages = controller.instance_variable_get(:@flash_array).pluck(:message)
      expect(messages).to include(match(/was saved/i))

      # make sure current_group is set and saved
      user.reload
      expect(user.current_group.id).to eq(group.id)
    end

    pending "should set current_group when editing" do
      existing_user_edit(user, {
        :group => group.id.to_s,
      })

      controller.instance_variable_set(:@_params, :typ => nil, :button => 'save', :id => user.id)
      controller.send(:rbac_edit_save_or_add, 'user')

      # make sure it returned success
      messages = controller.instance_variable_get(:@flash_array).pluck(:message)
      expect(messages).to include(match(/was saved/i))

      # make sure current_group is set and saved
      user.reload
      expect(user.current_group.id).to eq(group.id)
    end
  end
end

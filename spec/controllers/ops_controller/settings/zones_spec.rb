describe OpsController do
  before { login_as FactoryBot.create(:user_admin) }

  describe '#zone_edit' do
    before do
      allow(controller).to receive(:javascript_flash)
      allow(controller).to receive(:load_edit).and_return(true)
      controller.instance_variable_set(:@edit, :zone_id => nil, :new => {:password => 'pwd'}, :current => {})
      controller.params = {:button => 'add'}
    end

    it 'sets flash array according to the missing name, description and verify password' do
      controller.send(:zone_edit)
      expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => "Name can't be blank",                              :level => :error},
                                                                     {:message => "Description can't be blank",                       :level => :error},
                                                                     {:message => "Password and Verify Password fields do not match", :level => :error}])
    end
  end

  describe '#zone_field_changed' do
    before do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@edit, :zone_id => nil, :new => {}, :current => {})
      controller.params = {:name => 'Zone', :password => 'pwd'}
    end

    it 'sets session[:changed] to true' do
      controller.send(:zone_field_changed)
      expect(session[:changed]).to be(true)
    end
  end
end

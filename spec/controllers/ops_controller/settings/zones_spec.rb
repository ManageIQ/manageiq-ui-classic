describe OpsController do
  describe '#zone_field_changed' do
    let(:edit) { {:new => {}, :current => {}} }
    let(:params) { {:id => 'new'} }

    before do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:render).and_return(true)
      controller.instance_variable_set(:@_params, params)
      controller.instance_variable_set(:@edit, edit)
      login_as FactoryBot.create(:user_admin)
    end

    it 'sets session[:changed] to false if name and/or description is missing' do
      controller.send(:zone_field_changed)
      expect(controller.session[:changed]).to eq(false)
    end

    context 'adding new Zone' do
      let(:edit) { {:new => {:name => 'zone_name'}, :current => {}} }
      let(:params) { {:id => 'new', :description => 'zone_description'} }

      it 'sets session[:changed] to true if it is possible to save new Zone' do
        controller.send(:zone_field_changed)
        expect(controller.session[:changed]).to eq(true)
      end
    end

    context 'editing an existing Zone' do
      let(:edit) { {:new => {:name => zone.name, :description => zone.description}, :current => {:name => zone.name, :description => zone.description}} }
      let(:params) { {:userid => 'user_id'} }
      let(:zone) { FactoryBot.create(:zone) }

      it 'sets session[:changed] to true if there is any change and required fields are filled in' do
        controller.send(:zone_field_changed)
        expect(controller.session[:changed]).to eq(true)
      end

      context 'missing Verify Password if Password filled in' do
        let(:params) { {:password => 'pwd'} }

        subject { controller.instance_variable_get(:@edit)[:new] }

        it 'sets session[:changed] to false' do
          controller.send(:zone_field_changed)
          password_fields_changed = !(subject[:password].blank? ^ subject[:verify].blank?)
          expect(controller.session[:changed] && password_fields_changed).to eq(false)
        end
      end
    end
  end
end

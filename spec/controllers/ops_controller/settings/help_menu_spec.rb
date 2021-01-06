describe OpsController do
  describe 'OpsController::Settings::HelpMenu' do
    include_context "valid session"

    describe '#help_menu_form_field_changed' do
      let(:session) do
        {
          :edit => {
            :new => {
              :documentation => {
                :title => 'something'
              },
            },
            :key => 'customize_help_menu'
          }
        }
      end

      before do
        stub_user(:features => %w[region_edit])
      end

      it 'sets the form field value internally' do
        post :help_menu_form_field_changed, :params => {:documentation_title => 'something_else'}, :session => session
        expect(assigns(:edit)[:new][:documentation][:title]).to eq('something_else')
      end
    end
  end
end

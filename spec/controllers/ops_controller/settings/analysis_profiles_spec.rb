describe OpsController do
  describe '#ap_edit' do
    before do
      allow(controller).to receive(:assert_privileges)
    end

    describe '#ap_save_profile' do
      let(:render_response) { double('render_response') }

      before do
        allow(controller).to receive(:render).and_return(render_response)
      end

      context 'when saving a new Analysis Profile from React form data' do
        let(:form_data) do
          {
            :name        => 'Name1',
            :description => 'Description1',
            :scan_mode   => 'Vm',
            :file        => [{'target' => '/tmp/test', 'content' => true}]
          }.to_json
        end

        it 'renders a success JSON response' do
          controller.params = {:button => 'add', :id => 'new', :form_data => form_data}

          expect(controller).to receive(:render).with(
            :json => hash_including(
              :success => true,
              :message => 'Analysis Profile "Name1" was saved',
              :id      => kind_of(Integer)
            )
          )

          controller.send(:ap_edit)
        end
      end

      context 'when saving without a name' do
        let(:form_data) do
          {
            :description => 'Description1',
            :scan_mode   => 'Vm',
            :file        => [{'target' => '/tmp/test', 'content' => true}]
          }.to_json
        end

        it 'renders an unprocessable entity response' do
          controller.params = {:button => 'add', :id => 'new', :form_data => form_data}

          expect(controller).to receive(:render).with(
            :json   => {:error => 'Name is required'},
            :status => 422
          )

          controller.send(:ap_edit)
        end
      end

      context 'when saving without any scan items' do
        let(:form_data) do
          {
            :name        => 'Name1',
            :description => 'Description1',
            :scan_mode   => 'Vm'
          }.to_json
        end

        it 'renders an unprocessable entity response' do
          controller.params = {:button => 'add', :id => 'new', :form_data => form_data}

          expect(controller).to receive(:render).with(
            :json   => {:error => 'At least one item must be entered to create Analysis Profile'},
            :status => 422
          )

          controller.send(:ap_edit)
        end
      end
    end

    context 'when resetting the form' do
      before do
        controller.instance_variable_set(:@sb, {})
        allow(controller).to receive(:replace_right_cell)
      end

      it 'rebuilds the edit screen' do
        controller.params = {:button => 'reset', :typ => 'Vm'}

        controller.send(:ap_edit)

        expect(assigns(:in_a_form)).to be(true)
        expect(assigns(:scan)).to be_a(ScanItemSet)
      end
    end
  end
end

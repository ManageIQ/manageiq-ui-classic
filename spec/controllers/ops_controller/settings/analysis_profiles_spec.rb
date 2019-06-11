describe OpsController do
  describe '#ap_set_record_vars_set' do
    let(:scanitemset) { double }

    context 'missing description' do
      it 'sets scanitemset parameters' do
        expect(scanitemset).to receive(:name=).with('some_name')
        expect(scanitemset).to receive(:description=).with('')
        expect(scanitemset).to receive(:mode=).with(nil)

        subject.instance_variable_set(:@edit, :new => {:name => 'some_name'})

        subject.send(:ap_set_record_vars_set, scanitemset)
      end
    end
  end

  describe '#ap_edit' do
    context 'adding a new Analysis Profile' do
      let(:desc) { 'Description1' }
      let(:edit) do
        {:scan_id => nil,
         :key     => 'ap_edit__new',
         :new     => {:name        => 'Name1',
                      :description => desc,
                      "file"       => {:definition => {"stats" => [{}]}}}}
      end

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:ap_set_record_vars_set).and_call_original
        allow(controller).to receive(:get_node_info)
        allow(controller).to receive(:replace_right_cell)
        allow(controller).to receive(:session).and_return(:edit => edit)
        controller.params = {:button => 'add'}
      end

      it 'sets the flash message for adding a new Analysis Profile properly' do
        expect(controller).to receive(:add_flash).with("Analysis Profile \"#{desc}\" was saved")
        controller.send(:ap_edit)
      end
    end
  end
end

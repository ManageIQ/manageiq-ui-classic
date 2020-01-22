describe OpsController do
  describe '#upload_csv' do
    let(:file) { StringIO.new("name,category,entry\nevm1,Environment,Test") }

    before do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:redirect_to)
      controller.instance_variable_set(:@sb, :active_tab => 'settings_tags', :selected_server_id => 123)
      controller.params = {:typ => 'tag', :upload => {:file => ActionDispatch::Http::UploadedFile.new(:tempfile => file)}}
    end

    it 'adds error flash message to @flash_array regarding importing tags for VM using a CSV file' do
      controller.send(:upload_csv)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Name: evm1: Unable to find VM', :level => :error)
    end
  end
end

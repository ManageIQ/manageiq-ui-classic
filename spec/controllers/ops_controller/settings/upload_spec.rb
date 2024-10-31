describe OpsController do
  before do
    stub_user(:features => :all)
  end

  describe '#upload_png' do
    before do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:redirect_to)
      controller.instance_variable_set(:@sb, :active_tab => 'settings_custom_logos', :selected_server_id => 123)
    end

    it 'adds success flash message to @flash_array regarding updating custom logo image with a .png file' do
      controller.params = {:upload => {:logo => fixture_file_upload('spec/fixtures/image.png', 'image/png')}}
      controller.send(:upload_logo)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom logo image "image.png" uploaded', :level => :success)
    end

    it 'adds error flash message to @flash_array regarding updating custom logo image with a non-png file' do
      controller.params = {:upload => {:logo => fixture_file_upload('spec/fixtures/test.txt.png', 'image/png')}}
      controller.send(:upload_logo)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom logo image must be a .png file', :level => :error)

      controller.params = {:upload => {:logo => fixture_file_upload('spec/fixtures/favicon.ico', 'image/png')}}
      controller.send(:upload_logo)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom logo image must be a .png file', :level => :error)
    end

    it 'adds success flash message to @flash_array regarding updating custom login and about screen background image with a .png file' do
      controller.params = {:login => {:logo => fixture_file_upload('spec/fixtures/image.png', 'image/png')}}
      controller.send(:upload_login_logo)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom login image "image.png" uploaded', :level => :success)
    end

    it 'adds error flash message to @flash_array regarding updating custom login and about screen background image with a non .png file' do
      controller.params = {:login => {:logo => fixture_file_upload('spec/fixtures/test.txt.png', 'image/png')}}
      controller.send(:upload_login_logo)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom login image must be a .png file', :level => :error)

      controller.params = {:login => {:logo => fixture_file_upload('spec/fixtures/favicon.ico', 'image/png')}}
      controller.send(:upload_login_logo)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom login image must be a .png file', :level => :error)
    end

    it 'adds success flash message to @flash_array regarding updating custom brand image with a .png file' do
      controller.params = {:brand => {:logo => fixture_file_upload('spec/fixtures/image.png', 'image/png')}}
      controller.send(:upload_login_brand)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom brand "image.png" uploaded', :level => :success)
    end

    it 'adds error flash message to @flash_array regarding updating custom brand image with a non .png file' do
      controller.params = {:brand => {:logo => fixture_file_upload('spec/fixtures/test.txt.png', 'image/png')}}
      controller.send(:upload_login_brand)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom brand must be a .png file', :level => :error)

      controller.params = {:brand => {:logo => fixture_file_upload('spec/fixtures/favicon.ico', 'image/png')}}
      controller.send(:upload_login_brand)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom brand must be a .png file', :level => :error)
    end
  end

  describe '#upload_ico' do
    before do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:redirect_to)
      controller.instance_variable_set(:@sb, :active_tab => 'settings_custom_logos', :selected_server_id => 123)
    end

    it 'adds success flash message to @flash_array regarding updating custom favicon with an .ico file' do
      controller.params = {:favicon => {:logo => fixture_file_upload('spec/fixtures/favicon.ico', 'image/vnd.microsoft.icon')}}
      controller.send(:upload_favicon)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom favicon "favicon.ico" uploaded', :level => :success)
    end

    it 'adds error flash message to @flash_array regarding updating custom favicon with a non .ico file' do
      controller.params = {:favicon => {:logo => fixture_file_upload('spec/fixtures/test.txt.ico', 'image/vnd.microsoft.icon')}}
      controller.send(:upload_favicon)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom favicon must be a .ico file', :level => :error)

      controller.params = {:favicon => {:logo => fixture_file_upload('spec/fixtures/favicon.png.ico', 'image/vnd.microsoft.icon')}}
      controller.send(:upload_favicon)
      expect(controller.instance_variable_get(:@flash_array)).to include(:message => 'Custom favicon must be a .ico file', :level => :error)
    end
  end

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

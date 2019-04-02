describe AutomateImportJsonSerializerService do
  let(:automate_import_json_serializer_service) { described_class.new }

  describe '#serialize' do
    let(:miq_ae_yaml_import_zipfs) { double('MiqAeYamlImportZipfs') }
    let(:import_file_upload) { double('ImportFileUpload') }
    let(:binary_blob) { double('BinaryBlob') }

    let(:expected_json) do
      [
        {
          'text'       => 'Customer',
          'key'        => 'Customer',
          'icon'       => 'fa fa-globe',
          'selectable' => false,
          'nodes'      => [
            {
              'text'       => 'EVMApplications',
              'key'        => 'EVMApplications',
              'icon'       => 'pficon pficon-folder-close',
              'selectable' => false,
              'nodes'      => [
                {
                  'text'       => 'Operations',
                  'key'        => 'EVMApplications/Operations',
                  'icon'       => 'pficon pficon-folder-close',
                  'selectable' => false,
                  'nodes'      => [
                    {
                      'text'       => 'Profile',
                      'key'        => 'EVMApplications/Operations/Profile',
                      'icon'       => 'pficon pficon-folder-close',
                      'selectable' => false,
                      'nodes'      => []
                    }, {
                      'text'       => 'Profile.class',
                      'key'        => 'EVMApplications/Operations/Profile.class',
                      'icon'       => 'ff ff-class',
                      'selectable' => false
                    }
                  ]
                }
              ]
            }
          ]
        }, {
          'text'       => 'ManageIQ',
          'key'        => 'ManageIQ',
          'icon'       => 'fa fa-globe',
          'selectable' => false,
          'nodes'      => [],
        }
      ]
    end

    let(:tempfile) { Tempfile.new('test') }

    before do
      allow(import_file_upload).to receive(:binary_blob).and_return(binary_blob)
      allow(binary_blob).to receive(:binary).and_return('a bunch of junk')
      allow(tempfile).to receive(:binmode)
      allow(tempfile).to receive(:close)
      allow(Tempfile).to receive(:open).with(['automate_temporary_zip', '.zip']).and_yield(tempfile)
      allow(MiqAeImport).to receive(:new).with('*', 'zip_file' => tempfile.path).and_return(miq_ae_yaml_import_zipfs)
      allow(miq_ae_yaml_import_zipfs).to receive(:domain_entries).with('*').and_return(
        ['Customer/test1.yml', 'ManageIQ/test2.yml']
      )
      allow(miq_ae_yaml_import_zipfs).to receive(:namespace_files).with('Customer').and_return(
        ['Customer/EVMApplications/test.yml']
      )
      allow(miq_ae_yaml_import_zipfs).to receive(:namespace_files).with('ManageIQ').and_return([])
      allow(miq_ae_yaml_import_zipfs).to receive(:namespace_files).with('Customer/EVMApplications').and_return(
        ['Customer/EVMApplications/Operations/test.yml']
      )
      allow(miq_ae_yaml_import_zipfs).to receive(:namespace_files).with(
        'Customer/EVMApplications/Operations'
      ).and_return(
        ['Customer/EVMApplications/Operations/Profile/test.yml']
      )
      allow(miq_ae_yaml_import_zipfs).to receive(:namespace_files).with(
        'Customer/EVMApplications/Operations/Profile'
      ).and_return([])

      allow(miq_ae_yaml_import_zipfs).to receive(:class_files).with('Customer').and_return([])
      allow(miq_ae_yaml_import_zipfs).to receive(:class_files).with('Customer/EVMApplications').and_return([])
      allow(miq_ae_yaml_import_zipfs).to receive(:class_files).with('Customer/EVMApplications/Operations').and_return(
        ['Customer/EVMApplications/Operations/Profile.class/test.yml']
      )
      allow(miq_ae_yaml_import_zipfs).to receive(:class_files).with(
        'Customer/EVMApplications/Operations/Profile'
      ).and_return([])
      allow(miq_ae_yaml_import_zipfs).to receive(:class_files).with('ManageIQ').and_return([])
    end

    after do
      tempfile.unlink
    end

    it "sets the tempfile to binmode, writes to it, and then closes it" do
      expect(tempfile).to receive(:binmode).ordered
      expect(tempfile).to receive(:write).with("a bunch of junk").ordered
      expect(tempfile).to receive(:close).ordered

      automate_import_json_serializer_service.serialize(import_file_upload)
    end

    it 'returns the correct json' do
      expect(JSON.parse(automate_import_json_serializer_service.serialize(import_file_upload))).to eq(expected_json)
    end
  end
end

describe OpsController do
  include_context "valid session"

  describe '#label_tag_mapping_edit' do
    it "initilizes form for new mapping" do
      post :label_tag_mapping_edit
      expect(assigns(:edit)[:new]).to include(:entity => nil, :label_name => nil, :category => nil)
    end

    def use_form_to_create_mapping
      post :label_tag_mapping_edit
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :entity => 'ContainerProject' }
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :label_name => 'my-label' }
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :category => 'My Cat' }
      post :label_tag_mapping_edit, :params => { :button => 'add' }
    end

    def use_form_to_create_amazon_mapping
      post :label_tag_mapping_edit
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :entity => 'Vm' }
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :label_name => 'some-amazon-label' }
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :category => 'Amazon Vms' }
      post :label_tag_mapping_edit, :params => { :button => 'add' }
    end

    it "creates new mapping on save" do
      use_form_to_create_mapping
      mapping = ContainerLabelTagMapping.last
      expect(mapping.labeled_resource_type).to eq('ContainerProject')
      expect(mapping.label_name).to eq('my-label')
      expect(mapping.label_value).to be nil
      expect(mapping.tag.classification.category?).to be true
      expect(mapping.tag.classification.description).to eq('kubernetes:container_project|My Cat')
    end

    it "creates new scoped mapping on save" do
      use_form_to_create_amazon_mapping
      mapping = ContainerLabelTagMapping.last
      expect(mapping.labeled_resource_type).to eq('Vm')
      expect(mapping.label_name).to eq('some-amazon-label')
      expect(mapping.label_value).to be nil
      expect(mapping.tag.classification.category?).to be true
      expect(mapping.tag.classification.description).to eq('amazon:vm|Amazon Vms')
    end

    it "can edit an existing mapping" do
      use_form_to_create_mapping
      mapping = ContainerLabelTagMapping.last

      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s }
      expect(assigns(:edit)[:new]).to include(:entity     => 'ContainerProject',
                                              :label_name => 'my-label',
                                              :category   => 'My Cat')

      post :label_tag_mapping_field_changed, :params => { :id => mapping.id.to_s, :category => 'Edited Cat' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'ContainerProject',
                                              :label_name => 'my-label',
                                              :category   => 'Edited Cat')

      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s, :button => 'reset' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'ContainerProject',
                                              :label_name => 'my-label',
                                              :category   => 'My Cat')

      post :label_tag_mapping_field_changed, :params => { :id => mapping.id.to_s, :category => 'Edited Again Cat' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'ContainerProject',
                                              :label_name => 'my-label',
                                              :category   => 'Edited Again Cat')

      # Kludge: @flash_array contains "was added" from previous actions since
      # we're reusing one controller in the test.
      controller.instance_variable_set :@flash_array, nil
      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s, :button => 'save' }
      expect(mapping.tag.classification.description).to eq('kubernetes:container_project|Edited Again Cat')
    end

    it "can edit an existing scoped mapping" do
      use_form_to_create_amazon_mapping
      mapping = ContainerLabelTagMapping.last

      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s }
      expect(assigns(:edit)[:new]).to include(:entity     => 'Vm',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Amazon Vms')

      post :label_tag_mapping_field_changed, :params => { :id => mapping.id.to_s, :category => 'Edited Amazon' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'Vm',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Edited Amazon')

      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s, :button => 'reset' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'Vm',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Amazon Vms')

      post :label_tag_mapping_field_changed, :params => { :id => mapping.id.to_s, :category => 'Edited Again Amazon' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'Vm',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Edited Again Amazon')

      controller.instance_variable_set :@flash_array, nil
      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s, :button => 'save' }
      expect(mapping.tag.classification.description).to eq('amazon:vm|Edited Again Amazon')
    end
  end
end

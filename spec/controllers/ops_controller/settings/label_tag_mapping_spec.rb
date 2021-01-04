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
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :entity => 'VmAmazon' }
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :label_name => 'some-amazon-label' }
      post :label_tag_mapping_field_changed, :params => { :id => 'new', :category => 'Amazon Vms' }
      post :label_tag_mapping_edit, :params => { :button => 'add' }
    end

    def use_form_to_create_all_entities_mapping(label_name, category)
      post :label_tag_mapping_edit
      post :label_tag_mapping_field_changed, :params => {:id => 'new', :entity => '_all_entities_'}
      post :label_tag_mapping_field_changed, :params => {:id => 'new', :label_name => label_name}
      post :label_tag_mapping_field_changed, :params => {:id => 'new', :category => category}
      post :label_tag_mapping_edit, :params => {:button => 'add'}
    end

    it "creates new mapping on save" do
      use_form_to_create_mapping
      mapping = ProviderTagMapping.last
      expect(mapping.labeled_resource_type).to eq('ContainerProject')
      expect(mapping.label_name).to eq('my-label')
      expect(mapping.label_value).to be nil
      expect(mapping.tag.classification.category?).to be true
      expect(mapping.tag.classification.description).to eq('kubernetes:container_project|My Cat')
    end

    it "creates new scoped mapping on save" do
      use_form_to_create_amazon_mapping
      mapping = ProviderTagMapping.last
      expect(mapping.labeled_resource_type).to eq('VmAmazon')
      expect(mapping.label_name).to eq('some-amazon-label')
      expect(mapping.label_value).to be nil
      expect(mapping.tag.classification.category?).to be true
      expect(mapping.tag.classification.description).to eq('amazon:vm|Amazon Vms')
    end

    let!(:classification_department) { FactoryBot.create(:classification_department_with_tags) }
    let(:label_name) { 'some-amazon-label' }
    let(:all_entities) { '_all_entities_' }

    it "doesn't create mapping for all entities when label is already mapped" do
      use_form_to_create_all_entities_mapping(label_name, classification_department.description)
      errors = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }
      expect(errors).to be_empty

      controller.instance_variable_set(:@flash_array, nil)

      use_form_to_create_all_entities_mapping(label_name, classification_department.description)
      error_message = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }.first[:message]
      expect(error_message).to eq("Mapping for \"All Entities\", Label \"#{label_name}\" and Tag Category \"#{classification_department.description}\" already exists")
    end

    it "doesn't create mapping for all entities when category name doesn't exist" do
      use_form_to_create_all_entities_mapping(label_name, "XXX")

      error_message = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }.first[:message]
      expect(error_message).to eq("Mapping for \"All Entities\", Label \"#{label_name}\": Tag Category \"XXX\" must exist")
    end

    let!(:classification_department) { FactoryBot.create(:classification_department_with_tags) }

    it "doesn't create mapping for all entities when tag from label is already created" do
      use_form_to_create_all_entities_mapping(label_name, classification_department.description)
      errors = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }
      expect(errors).to be_empty

      controller.instance_variable_set(:@flash_array, nil)

      use_form_to_create_all_entities_mapping(label_name, classification_department.description)
      error_message = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }.first[:message]
      expect(error_message).to eq("Mapping for \"All Entities\", Label \"#{label_name}\" and Tag Category \"#{classification_department.description}\" already exists")
    end

    it "creates new mapping for all entities on save" do
      use_form_to_create_all_entities_mapping(label_name, classification_department.description)

      mapping = ProviderTagMapping.last
      errors = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }
      expect(errors).to be_empty
      expect(mapping.labeled_resource_type).to eq(all_entities)
      expect(mapping.label_name).to eq(label_name)
      expect(mapping.label_value).to be nil
      expect(mapping.tag.classification.category?).to be true
      expect(mapping.tag.classification.description).to eq(classification_department.description)
    end

    let(:classification_cost_center) { FactoryBot.create(:classification_cost_center) }

    it "can edit an existing mapping for all entities" do
      use_form_to_create_all_entities_mapping(label_name, classification_department.description)
      mapping = ProviderTagMapping.last

      controller.instance_variable_set(:@flash_array, nil)

      post :label_tag_mapping_edit, :params => {:id => mapping.id.to_s}
      post :label_tag_mapping_field_changed, :params => {:id => mapping.id.to_s, :category => classification_cost_center.description}
      post :label_tag_mapping_edit, :params => {:id => mapping.id.to_s, :button => 'save'}

      errors = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }
      expect(errors).to be_empty

      mapping.reload

      expect(mapping.tag.id).to eq(classification_cost_center.tag.id)
    end

    it "deletes mapping but it doesn't delete classifications and taggins for all entities" do
      use_form_to_create_all_entities_mapping(label_name, classification_department.description)
      controller.instance_variable_set(:@flash_array, nil)

      mapping = ProviderTagMapping.last

      expect(ProviderTagMapping.where(:label_name => label_name, :tag => classification_department.tag).exists?).to be_truthy

      post :label_tag_mapping_delete, :params => {:id => mapping.id.to_s}

      errors = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }
      expect(errors).to be_empty

      expect(ProviderTagMapping.where(:label_name => label_name, :tag => classification_department.tag).exists?).to be_falsey
      expect(Classification.lookup_by_name(classification_department.name).name).to eq(classification_department.name)
    end

    it "cannot set category name of tag which does not exist on an existing mapping for all entities" do
      use_form_to_create_all_entities_mapping(label_name, classification_department.description)
      mapping = ProviderTagMapping.last

      controller.instance_variable_set(:@flash_array, nil)

      post :label_tag_mapping_edit, :params => {:id => mapping.id.to_s}
      post :label_tag_mapping_field_changed, :params => {:id => mapping.id.to_s, :category => 'XXX'}
      post :label_tag_mapping_edit, :params => {:id => mapping.id.to_s, :button => 'save'}

      error_message = controller.instance_variable_get(:@flash_array).select { |x| x[:level] == :error }.first[:message]
      expect(error_message).to eq("Mapping for \"All Entities\", Label \"#{label_name}\": Tag Category \"XXX\" must exist")
    end

    it "can edit an existing mapping" do
      use_form_to_create_mapping
      mapping = ProviderTagMapping.last

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
      mapping = ProviderTagMapping.last

      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s }
      expect(assigns(:edit)[:new]).to include(:entity     => 'VmAmazon',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Amazon Vms')

      post :label_tag_mapping_field_changed, :params => { :id => mapping.id.to_s, :category => 'Edited Amazon' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'VmAmazon',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Edited Amazon')

      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s, :button => 'reset' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'VmAmazon',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Amazon Vms')

      post :label_tag_mapping_field_changed, :params => { :id => mapping.id.to_s, :category => 'Edited Again Amazon' }
      expect(assigns(:edit)[:new]).to include(:entity     => 'VmAmazon',
                                              :label_name => 'some-amazon-label',
                                              :category   => 'Edited Again Amazon')

      controller.instance_variable_set :@flash_array, nil
      post :label_tag_mapping_edit, :params => { :id => mapping.id.to_s, :button => 'save' }
      expect(mapping.tag.name).to eq('/managed/amazon:vm:edited_again_amazon')
      expect(mapping.tag.classification.description).to eq('amazon:vm|Edited Again Amazon')
    end
  end
end

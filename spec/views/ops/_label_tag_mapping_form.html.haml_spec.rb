describe 'ops/_label_tag_mapping_form.html.haml' do
  before do
    assign(:sb, :active_tab => 'settings_label_tag_mapping')
  end

  context 'add new mapping' do
    before do
      @lt_map = nil
      @edit = {:id  => nil,
               :new => {:options    => [["<All>", nil]],
                        :entity     => nil,
                        :label_name => nil,
                        :category   => nil}}
      render :partial => "ops/label_tag_mapping_form"
    end

    it 'entity should be enabled when adding a new mapping' do
      expect(response.body).to include('<select name="entity" id="entity" class="selectpicker">')
    end

    it 'label should be enabled when adding a new mapping' do
      expect(response.body).to include('<input type="text" name="label_name" id="label_name" maxlength="25" class="form-control" data-miq_observe')
    end
  end

  context 'edit existing mapping' do
    let(:tag_category_parameters_for_haml) do
      {:lt_map       => @lt_map,
       :categories   => [],
       :category     => nil,
       :all_entities => false}
    end

    before do
      set_controller_for_view("ops")
      set_controller_for_view_to_be_nonrestful

      allow(view).to receive(:tag_category_parameters_for_haml).and_return(tag_category_parameters_for_haml)

      @lt_map = FactoryBot.create(:tag_mapping_with_category)
      @edit = {:id  => nil,
               :new => {:options    => [["<All>", nil]],
                        :entity     => nil,
                        :label_name => nil,
                        :category   => nil}}
      render :partial => "ops/label_tag_mapping_form"
    end

    it 'entity should be disabled when editing an existing mapping' do
      expect(response.body).to include('<select name="entity" id="entity" class="selectpicker" disabled="disabled">')
    end

    it 'label should be disabled when editing an existing mapping' do
      expect(response.body).to include('<input type="text" name="label_name" id="label_name" maxlength="25" class="form-control" disabled="disabled" data-miq_observe')
    end

    it 'category should be enabled when editing an existing mapping' do
      expect(response.body).to include('<input type="text" name="category" id="category" maxlength="50" class="form-control" data-miq_observe')
    end
  end
end

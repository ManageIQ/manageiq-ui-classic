describe CatalogHelper::TextualSummary do
  context '#textual_tags without tags' do
    before do
      @record = FactoryBot.create(:orchestration_template)
      session[:customer_name] = 'RspecName'
    end
    it 'returns Hash if no tags found' do
      tag = textual_tags
      expect(tag[:label]).to eq("%{name} Tags" % {:name => session[:customer_name]})
      expect(tag[:icon]).to eq("fa fa-tag")
      expect(tag[:value]).to eq("No %{label} Tags have been assigned" % {:label => session[:customer_name]})
    end
  end
  context '#textual_tags with tags' do
    before do
      @record = FactoryBot.create(:orchestration_template)
      parent = FactoryBot.create(:classification, :description => 'Label')
      value = FactoryBot.create(:classification, :description => 'Value', :parent_id => parent.id)
      tag = Tag.find_by(:id => value[:tag_id])
      tag[:name] = '/managed/description/name'
      tag.save!
      @record.tags.push(tag)
      session[:customer_name] = 'RspecName'
    end
    it 'returns tags correctly' do
      tag = textual_tags
      expect(tag[:label]).to eq("%{name} Tags" % {:name => session[:customer_name]})
      expect(tag[:value]).to be_a_kind_of(Array)
      expect(tag[:value].first).to eq(:icon => "fa fa-tag", :label => "Label", :value => ["Value"])
    end
  end

  include_examples "textual_group_smart_management"
end

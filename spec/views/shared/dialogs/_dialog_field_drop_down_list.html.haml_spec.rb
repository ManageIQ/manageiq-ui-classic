describe "shared/dialogs/dialog_field_drop_down_list.html.haml" do
  context 'display field value' do
    before do
      @edit = false
      attributes = {:values => [[nil, "<Choose>"], %w(Value1 Desc1), %w(Value2 Desc2)]}
      value = 'Value2'
      @field = DialogFieldDropDownList.new(:id => 1,
                                           :name => 'Options List Field',
                                           :type => 'DialogFieldDropDownList',
                                           :attributes => attributes, :value => value)
    end

    it 'shows the display value for the dropdown field' do
      render :partial => "/shared/dialogs/dialog_field_drop_down_list.html.haml", :locals => {:edit => @edit, :field => @field}
      expect(rendered).to eq("Desc2\n")
    end
  end
end

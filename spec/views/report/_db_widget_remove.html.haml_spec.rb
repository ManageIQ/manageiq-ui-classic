describe "report/_db_widget_remove.html.haml" do
  before do
    ws = FactoryBot.create(:miq_widget_set)
    assign(:dashboard, ws)
  end

  it "correctly renders patternfly classes" do
    widget = FactoryBot.create(:miq_widget)
    render :partial => "report/db_widget_remove",
           :locals  => {:widget => widget}
    expect(response).to have_selector('a.pull-right')
    expect(response).to have_selector('i.fa.fa-remove')
  end
end

require "ostruct"

describe "miq_policy/show_list.html.haml" do
  helper(JsHelper)
  helper(GtlHelper)
  helper(ApplicationHelper)

  it "renders flash message for cancelled creation of new Policy" do
    assign(:view, OpenStruct.new(:table => OpenStruct.new(:data => [])))
    assign(:flash_array, [{:message => "Add of new Policy was cancelled by the user",
                           :level   => :success}])
    render :partial => "layouts/gtl"
    expect(rendered).to match "Add of new Policy was cancelled by the user"
  end
end

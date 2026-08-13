describe ExpressionEditorController, "routing" do
  describe "GET #metadata" do
    it "routes /expression_editor/metadata to expression_editor#metadata" do
      expect(:get => "/expression_editor/metadata").to route_to("expression_editor#metadata")
    end
  end

  describe "GET #operators" do
    it "routes /expression_editor/operators to expression_editor#operators" do
      expect(:get => "/expression_editor/operators").to route_to("expression_editor#operators")
    end
  end

  describe "GET #tag_values" do
    it "routes /expression_editor/tag_values to expression_editor#tag_values" do
      expect(:get => "/expression_editor/tag_values").to route_to("expression_editor#tag_values")
    end
  end

  describe "GET #find_check_fields" do
    it "routes /expression_editor/find_check_fields to expression_editor#find_check_fields" do
      expect(:get => "/expression_editor/find_check_fields").to route_to("expression_editor#find_check_fields")
    end
  end
end

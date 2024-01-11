require "test_helper"

class ServiceTemplateCatalogControllerTest < ActionDispatch::IntegrationTest
  test "should get show_list" do
    get service_template_catalog_show_list_url
    assert_response :success
  end

  test "should get show" do
    get service_template_catalog_show_url
    assert_response :success
  end
end

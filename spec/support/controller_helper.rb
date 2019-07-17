module Spec
  module Support
    module ControllerHelper
      def assigns(key = nil)
        if key.nil?
          @controller.view_assigns.symbolize_keys
        else
          @controller.view_assigns[key.to_s]
        end
      end

      def setup_zone
        EvmSpecHelper.create_guid_miq_server_zone
      end

      shared_context "valid session" do
        let(:privilege_checker_service) { double("PrivilegeCheckerService", :valid_session? => true) }

        before do
          allow(controller).to receive(:set_user_time_zone)
          allow(PrivilegeCheckerService).to receive(:new).and_return(privilege_checker_service)
        end
      end

      def user_with_feature(features)
        features = EvmSpecHelper.specific_product_features(*features)
        FactoryBot.create(:user, :features => features)
      end

      def seed_session_trees(a_controller, active_tree, node = nil)
        session[:sandboxes] = {
          a_controller => {
            :trees       => {
              active_tree => {}
            },
            :active_tree => active_tree
          }
        }
        session[:sandboxes][a_controller][:trees][active_tree][:active_node] = node unless node.nil?
      end

      def session_to_sb(a_controller = nil)
        a_controller ||= controller.controller_name
        controller.instance_variable_set(:@sb, session[:sandboxes][a_controller])
      end

      def assert_nested_list(parent, children, relation, label, child_path: nil, gtl_types: nil)
        gtl_types    ||= %i(list tile grid)
        child_path   ||= relation.singularize
        parent_route = controller.restful? ? controller.class.table_name : "#{controller.class.table_name}/show"
        child_route  = "#{child_path}/show"

        controller.instance_variable_set(:@breadcrumbs, [])
        # TODO(lsmola) we should just cycle through all gtl types, to test all list views
        controller.instance_variable_set(:@gtl_type, gtl_types.first)
        # Get the nested table
        get :show, :params => {:id => parent.id, :display => relation}

        expect(response.status).to eq(200)
        expect(response).to render_template("layouts/listnav/_#{controller.class.table_name}")

        # Breadcrumbs of nested table contains the right link to itself, which will surface by clicking on the table item
        expect(assigns(:breadcrumbs)).to include(:name => "#{parent.name} (#{label})",
                                                 :url  => "/#{parent_route}/#{parent.id}?display=#{relation}")

        # TODO(lsmola) for some reason, the toolbar is not being rendered
        # expect(response.body).to include('title="Grid View" id="view_grid" data-url="/show/" data-url_parms="?type=grid"')
        # expect(response.body).to include('title="Tile View" id="view_tile" data-url="/show/" data-url_parms="?type=tile"')
        # expect(response.body).to include('title="List View" id="view_list" data-url="/show/" data-url_parms="?type=list"')

        # The table renders all children objects
        children.each do |_child_object|
          # expect(response.body).to include("modelName: '#{relation}'")
          expect(response.body).to include("activeTree: ''")
          expect(response.body).to include("gtlType: '#{gtl_types.first}'")
          expect(response.body).to include("parentId: '#{parent.id}'")
          expect(response.body).to include("showUrl: '/#{child_route}/'")
        end

        # display needs to be saved to session for GTL pagination and such
        expect(session["#{controller.class.table_name}_display".to_sym]).to eq(relation)
      end

      # Formats POST data for /report_data request
      #
      # Supported options:
      #   :model
      #   :parent_model
      #   :parent_id
      #   :active_tree
      #   :parent_method
      #   :gtl_dbname
      #   :explorer (defaults to true)
      #   :lastaction
      #
      # FIXME: This hash needs cleanups as we clenup the /report_data,
      #        angular/_gtl and the calling sites.
      #
      def report_data_request_data(options)
        explorer = options.key?(:explorer) ? options[:explorer] : true
        {
          'model_name'         => options[:model],
          'model'              => options[:model],
          'active_tree'        => options[:active_tree],
          'parent_id'          => options[:parent_id],
          'model_id'           => options[:parent_id],
          'report_name'        => options[:report_name],
          'explorer'           => explorer,
          'additional_options' => {
            'named_scope'           => options[:named_scope],
            'gtl_dbname'            => options[:gtl_dbname],
            'model'                 => options[:model],
            'match_via_descendants' => nil,
            'parent_id'             => options[:parent_id],
            'parent_class_name'     => options[:parent_model],
            'parent_method'         => options[:parent_method],
            'lastaction'            => options[:lastaction],
            'custom_action'         => {
              'url'  => options[:url],
              'type' => options[:type]
            },
            'association' => nil, 'view_suffix' => nil, 'embedded' => nil, 'showlinks' => nil, 'policy_sim' => nil
          }.compact
        }.compact
      end

      # Fires a POST request to the current controller's /report_data action
      #
      def report_data_request(options)
        request.headers['Content-Type'] = 'application/json'
        post :report_data, :params => report_data_request_data(options)
      end

      # Assert a valid /report_data response, parse the response.
      #
      # Returns: response as a hash
      #
      def assert_report_data_response
        expect(response.status).to eq(200)
        parsed_data = JSON.parse(response.body)
        expect(parsed_data).to have_key('settings')
        expect(parsed_data).to have_key('data')
        parsed_data
      end

      RSpec::Matchers.define :match_gtl_options do |expected|
        def matches_additional(actual, expected)
          return true unless expected
          expected.keys.find_all { |key| expected[key] != actual.send(key) }.empty?
        end

        def matches_basic(actual, expected)
          expected.keys.find_all { |key| expected[key] != actual[key] }.empty?
        end

        def matches_selected_records(actual, expected)
          return true unless expected
          actual.sort == expected.sort
        end

        match do |actual|
          additional_options = expected.delete(:report_data_additional_options)
          selected_records = expected.delete(:selected_records)
          matches_basic(actual, expected) && matches_additional(actual[:report_data_additional_options], additional_options) && matches_selected_records(actual[:selected_records], selected_records)
        end
      end
    end
  end
end

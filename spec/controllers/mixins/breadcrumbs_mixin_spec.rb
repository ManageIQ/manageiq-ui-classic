describe Mixins::BreadcrumbsMixin do
  class BreadcrumbsTestController < ActionController::Base
    include Mixins::BreadcrumbsMixin
  end

  subject { BreadcrumbsTestController.new }

  let(:tree) { TreeBuilderUtilization.new(:utilization_tree, {}, false) }
  let(:breadcrumbs_options) do
    {
      :breadcrumbs => [
        {:title => _("First Layer")},
        {:title => _("Second Layer")},
      ]
    }
  end

  before do
    allow(subject).to receive(:breadcrumbs_options).and_return(breadcrumbs_options)
  end

  context 'mixin loaded into an explorer controller' do
    before do
      subject.instance_variable_set(:@sb, :explorer => true)

      allow(subject).to receive(:features).and_return([
        {
          :role_any => true,
          :name     => :utilization,
          :title    => _("Utilization")
        },
        {
          :role_any => true,
          :name     => :old_dialogs,
          :title    => _("Dialogs")
        }
      ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) })

      allow(subject).to receive(:x_active_accord).and_return(:utilization)
      allow(subject).to receive(:x_active_tree).and_return(:utilization_tree)

      allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
    end

    describe "#url" do
      it "returns url" do
        expect(subject.url('ems', 'show', 'node')).to eq("/ems/show/node")
      end
    end

    describe "#accord_title" do
      context 'when features contains the tree' do
        it "returns title" do
          expect(subject.accord_title).to eq("Utilization")
        end
      end

      context 'when features do not contains the tree' do
        before { allow(subject).to receive(:x_active_accord).and_return(:not_tree) }

        it "returns nil" do
          expect(subject.accord_title).to be(nil)
        end
      end
    end

    context 'build tree' do
      let(:tree_nodes) do
        [
          {
            :key   => 'root',
            :text  => 'Root Node',
            :nodes => [
              {:key => 'xx-1', :text => 'Item 1'},
              {:key => 'xx-2', :text => 'Item 2'}
            ]

          }
        ]
      end

      before do
        allow(subject).to receive(:x_node).and_return("xx-1")
        allow(subject).to receive(:x_node_right_cell).and_return("xx-1")
        allow(subject).to receive(:params).and_return({})
        allow(TreeBuilderUtilization).to receive(:new).and_return(tree)
        allow(tree).to receive(:tree_nodes).and_return(tree_nodes)
      end

      describe "#build_breadcrumb_from_tree" do
        let(:tree) { TreeBuilderUtilization.new(:utilization_tree, {}, false) }

        before do
          allow(tree).to receive(:tree_nodes).and_return(tree_nodes)
        end

        it "returns last item as a breadcrumb" do
          subject.instance_variable_set(:@trees, [tree])

          expect(subject.build_breadcrumb_from_tree).to eq(:key => "xx-1", :title => "Item 1")
        end
      end

      describe "#data_for_breadcrumbs" do
        before { subject.instance_variable_set(:@x_node_text, :utilization_tree => "Item 1") }
        it "creates breadcrumbs" do
          expect(subject.data_for_breadcrumbs).to eq(
            [
              {:title => "First Layer"},
              {:title => "Second Layer"},
              {:title => "Utilization", :key => "root"},
              {:key => "xx-1", :title => "Item 1"},
            ]
          )
        end
      end

      describe "#ancestry_parents" do
        let(:service_1) { FactoryBot.create(:service) }
        let(:service_2) { FactoryBot.create(:service, :parent => service_1) }
        let(:service_3) { FactoryBot.create(:service, :parent => service_2) }

        it "creates one level nested breadcrumbs" do
          expect(Service).to receive(:find).and_return(service_1)
          expect(TreeBuilder).to receive(:build_node_id).and_return("xx-#{service_1.id}")

          expect(subject.ancestry_parents(Service, service_2, :name)).to eq(
            [
              {:title => service_1.name, :key => "xx-#{service_1.id}"}
            ]
          )
        end

        it "creates two level nested breadcrumbs" do
          expect(Service).to receive(:find).and_return(service_2, service_1)
          expect(TreeBuilder).to receive(:build_node_id).and_return("xx-#{service_2.id}", "xx-#{service_1.id}")

          expect(subject.ancestry_parents(Service, service_3, :name)).to eq(
            [
              {:title => service_1.name, :key => "xx-#{service_1.id}"},
              {:title => service_2.name, :key => "xx-#{service_2.id}"},
            ]
          )
        end
      end

      describe "#action_breadcrumb?" do
        let(:options) do
          {
            :right_cell_text => 'Record Edit of Item 1'
          }
        end

        before do
          subject.instance_variable_set(:@sb, :explorer => true, :action => 'record_edit')
          subject.instance_variable_set(:@trees, [tree])
        end

        it "returns action breadcrumb" do
          expect(subject.data_for_breadcrumbs(options).last).to eq(:title => "Record Edit of Item 1")
        end

        it "not return action breadcrumb if cancel button" do
          allow(subject).to receive(:params).and_return(:button => 'cancel')

          expect(subject.data_for_breadcrumbs(options).last).to eq(:title => "Item 1", :key => "xx-1")
        end

        it "not return action breadcrumb if actions is prohibited to build breadcrumb" do
          allow(subject).to receive(:action_name).and_return('tree_select')

          expect(subject.data_for_breadcrumbs(options).last).to eq(:title => "Item 1", :key => "xx-1")
        end

        it "not return action breadcrumb if save button" do
          allow(subject).to receive(:params).and_return(:button => 'save')

          expect(subject.data_for_breadcrumbs(options).last).to eq(:title => "Item 1", :key => "xx-1")
        end
      end

      context "not_tree set" do
        let(:breadcrumbs_options) do
          {
            :breadcrumbs => [
              {:title => _("First Layer")},
              {:title => _("Second Layer")},
            ],
            :not_tree    => true
          }
        end

        it "creates breadcrumbs with no tree section" do
          expect(subject.data_for_breadcrumbs).to eq(
            [
              {:title => "First Layer"},
              {:title => "Second Layer"},
            ]
          )
        end
      end
    end
  end

  context 'mixin loaded into a non-explorer controller' do
    describe '#data_for_breadcrumbs' do
      it "creates breadcrumbs" do
        expect(subject.data_for_breadcrumbs).to eq(
          [
            {:title=>"First Layer"},
            {:title=>"Second Layer"}
          ]
        )
      end

      context "record_info set" do
        let(:breadcrumbs_options) do
          {
            :breadcrumbs  => [
              {:title => _("First Layer")},
              {:title => _("Second Layer")},
            ],
            :record_info  => {
              :id        => 1234,
              :some_name => "record_info_title"
            },
            :record_title => :some_name
          }
        end

        before do
          subject.instance_variable_set(:@title, "Title")
          allow(subject).to receive(:gtl_url).and_return("/show")
        end

        it "creates breadcrumbs" do
          expect(subject.data_for_breadcrumbs).to eq(
            [
              {:title => "First Layer"},
              {:title => "Second Layer"},
              {:title => "record_info_title", :url => "/breadcrumbs_test/show/1234"},
              {:title => "Title"}
            ]
          )
        end

        it "creates breadcrumbs with :hide_title set" do
          breadcrumbs_options[:hide_title] = true

          expect(subject.data_for_breadcrumbs).to eq(
            [
              {:title => "First Layer"},
              {:title => "Second Layer"},
              {:title => "record_info_title", :url => "/breadcrumbs_test/show/1234"}
            ]
          )
        end

        context ":include_record set" do
          let(:breadcrumbs_options) do
            {
              :breadcrumbs    => [
                {:title => _("First Layer")},
                {:title => _("Second Layer")},
              ],
              :record_info    => {
                :id   => 1234,
                :name => "record_info_title"
              },
              :include_record => true
            }
          end

          it "creates breadcrumbs with :include_record set" do
            allow(subject).to receive(:action_name).and_return("show")
            allow(subject).to receive(:params).and_return({})

            expect(subject.data_for_breadcrumbs).to eq(
              [
                {:title => "First Layer"},
                {:title => "Second Layer"},
                {:title => "record_info_title", :url => "/breadcrumbs_test/show/1234"},
                {:title => "Title"}
              ]
            )
          end
        end
      end

      it "not contain header on show_list page" do
        allow(subject).to receive(:action_name).and_return("show_list")
        subject.instance_variable_set(:@title, "Do not show me")

        expect(subject.data_for_breadcrumbs).to eq(
          [
            {:title=>"First Layer"},
            {:title=>"Second Layer"}
          ]
        )
      end

      it "contain header on not show_list page" do
        allow(subject).to receive(:action_name).and_return("edot")
        subject.instance_variable_set(:@title, "Do show me")

        expect(subject.data_for_breadcrumbs).to eq(
          [
            {:title=>"First Layer"},
            {:title=>"Second Layer"},
            {:title=>"Do show me"}
          ]
        )
      end
    end

    describe "#same_as_last_breadcrumb?" do
      let(:breadcrumbs) do
        [
          {:title=>"controller"},
          {:title=>"header"}
        ]
      end

      it "returns true if header is same as last breadcrumb" do
        expect(subject.send(:same_as_last_breadcrumb?, breadcrumbs, "header")).to eq(true)
      end

      it "returns false if header is not same as last breadcrumb" do
        expect(subject.send(:same_as_last_breadcrumb?, breadcrumbs, "different header")).to eq(false)
      end

      it "returns false if header is same as last breadcrumb but it in the breadcrumbs on different place" do
        expect(subject.send(:same_as_last_breadcrumb?, breadcrumbs, "controller")).to eq(false)
      end
    end

    describe "#special_page_breadcrumb" do
      let(:controller_name) { 'test' }

      before do
        subject.send(:breadcrumbs_options)
        allow(subject).to receive(:controller_name).and_return(controller_name)
      end

      context "ems controller" do
        let(:tagitems) { [{:key => "ems", :id => "id"}] }
        let(:controller_name) { 'ems' }

        it "creates breadcrumbs" do
          expect(subject.special_page_breadcrumb(tagitems)).to eq(:title => "ems")
        end
      end

      context "floating_ips controller" do
        let(:tagitems) { [{ :id => "1", :address => "127.0.0.1"}] }
        let(:controller_name) { 'floating_ips' }

        it "creates breadcrumbs" do
          expect(subject.special_page_breadcrumb(tagitems)).to eq(:title => "127.0.0.1")
        end
      end

      context "other controllers" do
        let(:tagitems) { [{:id => "1789", :name => "item"}] }

        it "creates breadcrumbs" do
          expect(subject.special_page_breadcrumb(tagitems)).to eq(:title => "item")
        end
      end

      context "no title" do
        let(:tagitems) { [{:id => "1789", :description => "item"}] }

        it "returns nil" do
          expect(subject.special_page_breadcrumb(tagitems)).to eq(nil)
        end
      end

      context "more than one item is selected" do
        let(:tagitems) { [{:id => "1789", :description => "item"}, {:id => "1984", :description => "thing"}] }

        it "returns nil" do
          expect(subject.special_page_breadcrumb(tagitems)).to eq(nil)
        end
      end
    end
  end

  describe "session" do
    describe '#x_node_text_from_session' do
      it "Gets variables correctly" do
        allow(subject).to receive(:session).and_return(:x_node_text => {:utilization_tree => "Item 1"})
        subject.send(:x_node_text_from_session)

        expect(subject.instance_variable_get(:@x_node_text)).to eq(:utilization_tree => "Item 1")
      end
    end

    describe '#x_node_text_save_to_session' do
      it "Sets variables correctly" do
        allow(subject).to receive(:session).and_return({})
        subject.instance_variable_set(:@x_node_text, :utilization_tree => "Item 1")
        subject.send(:x_node_text_save_to_session)

        expect(subject.session[:x_node_text]).to eq(:utilization_tree => "Item 1")
      end
    end
  end

  describe "#x_node_text" do
    before { allow(subject).to receive(:x_active_tree).and_return(:utilization_tree) }
    it "sets text to @x_node_text" do
      subject.send(:x_node_text=, "VM UTIL 1")

      expect(subject.instance_variable_get(:@x_node_text)).to eq(:utilization_tree => "VM UTIL 1")
    end
  end
end

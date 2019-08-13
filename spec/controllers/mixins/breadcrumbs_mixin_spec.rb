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

    describe "#accord_name" do
      context 'when features contains the tree' do
        it "returns name" do
          expect(subject.accord_name).to eq(:utilization)
        end
      end

      context 'when features do not contains the tree' do
        before { allow(subject).to receive(:x_active_accord).and_return(:not_tree) }

        it "returns nil" do
          expect(subject.accord_name).to be(nil)
        end
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
      before do
        allow(subject).to receive(:x_node).and_return("xx-1")
        allow(TreeBuilderUtilization).to receive(:new).and_return(tree)
        allow(tree).to receive(:tree_nodes).and_return(
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
        )
      end

      describe "#build_breadcrumbs_from_tree" do
        it "returns breadcrumbs" do
          expect(subject.build_breadcrumbs_from_tree).to eq(
            [
              {:title => "Root Node", :key => "root"},
              {:title => "Item 1", :key => "xx-1"}
            ]
          )
        end
      end

      describe "#data_for_breadcrumbs" do
        it "creates breadcrumbs" do
          expect(subject.data_for_breadcrumbs).to eq(
            [
              {:title => "First Layer"},
              {:title => "Second Layer"},
              {:title => "Utilization", :key => "utilization_accord", :action => "accordion_select"},
              {:title => "Root Node", :key => "root"},
              {:title => "Item 1", :key => "xx-1"}
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

        it "creates breadcrumbs" do
          allow(subject).to receive(:gtl_url).and_return("/show")

          expect(subject.data_for_breadcrumbs).to eq(
            [
              {:title => "First Layer"},
              {:title => "Second Layer"},
              {:title => "record_info_title", :url => "/breadcrumbs_test/show/1234"}
            ]
          )
        end
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
end

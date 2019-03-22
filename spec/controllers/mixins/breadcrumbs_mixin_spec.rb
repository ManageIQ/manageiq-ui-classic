describe Mixins::BreadcrumbsMixin do
  # dummy for a tree

  class Tree
    attr_reader :name, :bs_tree

    def initialize(name, tree)
      @name = name
      @bs_tree = tree
    end
  end

  # dummy for a controller using Mixin

  class TestMixin < ApplicationController
    include Mixins::BreadcrumbsMixin

    def features
      feature_active = ApplicationController::Feature.new
      feature_active.name = :utilization_tree
      feature_active.title = "Active Tree"
      feature_active.container = "active_accord"

      feature_not_active1 = ApplicationController::Feature.new
      feature_not_active1.name = :old_dialog_tree
      feature_not_active1.title = "Dialog Tree"
      feature_not_active1.container = "dialog_accord"

      feature_not_active2 = ApplicationController::Feature.new
      feature_not_active2.name = :tree
      feature_not_active2.title = "Tree"
      feature_not_active2.container = "tree_accord"

      [
        feature_active,
        feature_not_active1,
        feature_not_active2,
      ]
    end

    def build_tree
      Tree.new(:active_tree, "[{\"key\":\"root\",\"text\":\"All Dialogs\", \"nodes\":[{\"key\":\"xx-1\",\"text\":\"Item1\"},{\"key\":\"xx-2\",\"text\":\"Item2\"}]}]")
    end
  end

  let(:mixin) { TestMixin.new }
  let(:controller_url) { 'testmixin' }
  let(:features) { [{:title => "Active Tree", :name => :utilization_tree, :container => "active_accord"}] }
  let(:breadcrumbs) do
    [
      {:title => _("First Layer")},
      {:title => _("Second Layer")},
    ]
  end

  before do
    allow(mixin).to receive(:controller_name).and_return("testmixin")
    allow(mixin).to receive(:breadcrumbs_options).and_return(:breadcrumbs => [
                                                               {:title => _("First Layer")},
                                                               {:title => _("Second Layer")},
                                                             ])
    allow(mixin).to receive(:x_node).and_return("xx-1")
    allow(mixin).to receive(:x_active_accord).and_return(:utilization_tree)
    allow(mixin).to receive(:x_active_tree).and_return(:active_tree)
    allow(mixin).to receive(:gtl_url).and_return("/show")
    mixin.instance_variable_set(:@sb, {})
  end

  describe "#url" do
    it "returns url" do
      expect(mixin.url('ems', 'show', 'node')).to eq("/ems/show/node")
    end
  end

  describe "#accord_name" do
    context 'when features contains the tree' do
      it "returns title" do
        expect(mixin.accord_name).to eq(features[0][:title])
      end
    end

    context 'when features do not contains the tree' do
      it "returns nil" do
        allow(mixin).to receive(:x_active_accord).and_return(:not_tree)
        expect(mixin.accord_name).to be(nil)
      end
    end
  end

  describe "#accord_container" do
    context 'when features contains the tree' do
      it "returns container" do
        expect(mixin.accord_container).to eq(features[0][:container])
      end
    end

    context 'when features do not contains the tree' do
      it "returns nil" do
        allow(mixin).to receive(:x_active_accord).and_return(:not_tree)
        expect(mixin.accord_container).to be(nil)
      end
    end
  end

  describe "#build_breadcrumbs_from_tree" do
    it "returns breadcrumbs" do
      expect(mixin.build_breadcrumbs_from_tree).to eq([
                                                        {:title => "All Dialogs", :key => "root"},
                                                        {:title => "Item1", :key => "xx-1"}
                                                      ])
    end
  end

  describe "#data_for_breadcrumbs" do
    context "when no explorer controller" do
      it "creates breadcrumbs" do
        expect(mixin.data_for_breadcrumbs).to eq([{:title=>"First Layer"}, {:title=>"Second Layer"}])
      end

      context "when record_info set" do
        let(:some_record) { {:id => "1234", :some_name => "record_info_title"} }

        it "creates breadcrumbs" do
          allow(mixin).to receive(:breadcrumbs_options).and_return(:breadcrumbs  => [
                                                                     {:title => _("First Layer")},
                                                                     {:title => _("Second Layer")},
                                                                   ],
                                                                   :record_info  => some_record,
                                                                   :record_title => :some_name)

          expect(mixin.data_for_breadcrumbs).to eq([{:title => "First Layer"},
                                                    {:title => "Second Layer"},
                                                    {:title => "record_info_title", :url => "/testmixin/show/1234"}])
        end
      end

      context "when show_list_title set" do
        it "creates breadcrumbs" do
          allow(mixin).to receive(:breadcrumbs_options).and_return(:breadcrumbs => [
                                                                     {:title => _("First Layer")},
                                                                     {:title => _("Second Layer")},
                                                                     {:url   => controller_url, :title => _("Providers")},
                                                                   ])

          expect(mixin.data_for_breadcrumbs).to eq([{:title => "First Layer"},
                                                    {:title => "Second Layer"},
                                                    {:title => "Providers", :url => "testmixin"}])
        end
      end
    end

    context "when explorer controller" do
      before do
        mixin.instance_variable_set(:@right_cell_text, "Right text")
        mixin.instance_variable_set(:@sb, :explorer => true)
      end

      it "creates breadcrumbs" do
        expect(mixin.data_for_breadcrumbs).to eq([{:title => "First Layer"},
                                                  {:title => "Second Layer"},
                                                  {:title => "Active Tree", :key => "active_accord", :action => "accordion_select"},
                                                  {:title => "All Dialogs", :key => "root"},
                                                  {:title => "Item1", :key => "xx-1"}])
      end
    end
  end

  describe "#special_page_breadcrumb" do
    before do
      mixin.send(:breadcrumbs_options)
    end

    context "when ems controller" do
      before do
        mixin.instance_variable_set(:@tagitems, [{:key => "ems", :id => "id"}])
        allow(mixin).to receive(:controller_name).and_return("ems")
      end

      it "create breadcrumbs" do
        expect(mixin.special_page_breadcrumb(mixin.instance_variable_get(:@tagitems))).to eq(
          :title => "ems"
        )
      end
    end

    context "when floating_ips controller" do
      before do
        mixin.instance_variable_set(:@tagitems, [{ :id => "1", :address => "172.0.0.1"}])
        allow(mixin).to receive(:controller_name).and_return("floating_ips")
      end

      it "create breadcrumbs" do
        expect(mixin.special_page_breadcrumb(mixin.instance_variable_get(:@tagitems))).to eq(
          :title => "172.0.0.1"
        )
      end
    end

    context "when others controller" do
      before do
        mixin.instance_variable_set(:@tagitems, [{:id => "1789", :name => "item"}])
      end

      it "create breadcrumbs" do
        expect(mixin.special_page_breadcrumb(mixin.instance_variable_get(:@tagitems))).to eq(
          :title => "item"
        )
      end
    end
  end
end

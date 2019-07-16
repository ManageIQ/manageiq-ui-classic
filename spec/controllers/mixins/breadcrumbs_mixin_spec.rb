describe Mixins::BreadcrumbsMixin do
  # dummy for a tree

  class Tree
    attr_reader :name, :bs_tree

    def initialize(name, tree)
      @name = name
      @bs_tree = tree
    end
  end

  # dummies for a controller using Mixin

  class TestMixinExplorer < ApplicationController
    include Mixins::BreadcrumbsMixin

    def features
      [
        {
          :role_any => true,
          :name     => :utilization_tree,
          :title    => _("Active Tree")
        },
        {
          :role_any => true,
          :name     => :old_dialog_tree,
          :title    => _("Dialog Tree")
        },
        {
          :role_any => true,
          :name     => :tree,
          :title    => _("Tree")
        }
      ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
    end

    def build_tree
      Tree.new(:active_tree, "[{\"key\":\"root\",\"text\":\"All Dialogs\", \"nodes\":[{\"key\":\"xx-1\",\"text\":\"Item1\"},{\"key\":\"xx-2\",\"text\":\"Item2\"}]}]")
    end
  end

  class TestMixin < ApplicationController
    include Mixins::BreadcrumbsMixin
  end

  let(:mixin_explorer) { TestMixinExplorer.new }
  let(:mixin) { TestMixin.new }
  let(:controller_url) { 'testmixin' }
  let(:features) { {:title => "Active Tree", :name => :utilization_tree} }
  let(:breadcrumbs) do
    [
      {:title => _("First Layer")},
      {:title => _("Second Layer")},
    ]
  end

  before do
    allow(mixin_explorer).to receive(:controller_name).and_return("testmixin")
    allow(mixin_explorer).to receive(:breadcrumbs_options).and_return(:breadcrumbs => [
                                                                        {:title => _("First Layer")},
                                                                        {:title => _("Second Layer")},
                                                                      ])
    allow(mixin_explorer).to receive(:x_node).and_return("xx-1")
    allow(mixin_explorer).to receive(:x_active_accord).and_return(:utilization_tree)
    allow(mixin_explorer).to receive(:x_active_tree).and_return(:active_tree)
    allow(mixin_explorer).to receive(:gtl_url).and_return("/show")
    mixin_explorer.instance_variable_set(:@sb, {})

    allow(mixin).to receive(:breadcrumbs_options).and_return(:breadcrumbs => [
                                                               {:title => _("First Layer")},
                                                               {:title => _("Second Layer")},
                                                             ])
    allow(mixin).to receive(:controller_name).and_return("testmixin")
    allow(mixin).to receive(:gtl_url).and_return("/show")
    mixin.instance_variable_set(:@sb, {})
  end

  describe "#url" do
    it "returns url" do
      expect(mixin_explorer.url('ems', 'show', 'node')).to eq("/ems/show/node")
    end
  end

  describe "#accord_name" do
    context 'when features contains the tree' do
      it "returns name" do
        expect(mixin_explorer.accord_name).to eq(features[:name])
      end
    end

    context 'when features do not contains the tree' do
      it "returns nil" do
        allow(mixin_explorer).to receive(:x_active_accord).and_return(:not_tree)
        expect(mixin_explorer.accord_name).to be(nil)
      end
    end
  end

  describe "#accord_title" do
    context 'when features contains the tree' do
      it "returns title" do
        expect(mixin_explorer.accord_title).to eq(features[:title])
      end
    end

    context 'when features do not contains the tree' do
      it "returns nil" do
        allow(mixin_explorer).to receive(:x_active_accord).and_return(:not_tree)
        expect(mixin_explorer.accord_title).to be(nil)
      end
    end
  end

  describe "#build_breadcrumbs_from_tree" do
    it "returns breadcrumbs" do
      expect(mixin_explorer.build_breadcrumbs_from_tree).to eq([
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
    end

    context "when explorer controller" do
      before do
        mixin_explorer.instance_variable_set(:@right_cell_text, "Right text")
        mixin_explorer.instance_variable_set(:@sb, :explorer => true)
      end

      it "creates breadcrumbs" do
        expect(mixin_explorer.data_for_breadcrumbs).to eq([{:title => "First Layer"},
                                                           {:title => "Second Layer"},
                                                           {:title => "Active Tree", :key => "utilization_tree_accord", :action => "accordion_select"},
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

    context "when no title" do
      before do
        mixin.instance_variable_set(:@tagitems, [{:id => "1789", :description => "item"}])
      end

      it "returns nil" do
        expect(mixin.special_page_breadcrumb(mixin.instance_variable_get(:@tagitems))).to eq(nil)
      end
    end

    context "more than one item is selected in GTL page" do
      before do
        mixin.instance_variable_set(:@tagitems, [{:id => "1789", :description => "item"}, {:id => "1984", :description => "thing"}])
      end

      it "returns nil" do
        expect(mixin.special_page_breadcrumb(mixin.instance_variable_get(:@tagitems))).to eq(nil)
      end
    end
  end

  describe "#ancestry_parents" do
    let(:service1) { FactoryBot.create(:service, :ancestry => nil) }
    let(:service2) { FactoryBot.create(:service, :ancestry => service1.id) }
    let(:service3) { FactoryBot.create(:service, :ancestry => service2.id) }

    it "creates one level nested breadcrumbs" do
      expect(Service).to receive(:find).and_return(service1)
      expect(TreeBuilder).to receive(:build_node_id).and_return("xx-#{service1.id}")
      expect(mixin.ancestry_parents(Service, service2, :name)).to eq([{:title => service1.name, :key => "xx-#{service1.id}"}])
    end

    it "creates two level nested breadcrumbs" do
      expect(Service).to receive(:find).and_return(service2, service1)
      expect(TreeBuilder).to receive(:build_node_id).and_return("xx-#{service2.id}", "xx-#{service1.id}")
      expect(mixin.ancestry_parents(Service, service3, :name)).to eq([
                                                                       {:title => service1.name, :key => "xx-#{service1.id}"},
                                                                       {:title => service2.name, :key => "xx-#{service2.id}"},
                                                                     ])
    end
  end
end

describe TreeBuilderReportWidgets do
  subject { described_class.new("cb_rates_tree", {}) }

  it "#set_locals_for_render (private)" do
    expect(subject.send(:set_locals_for_render)).to include(:autoload => true)
  end

  it "#x_get_tree_roots (private)" do
    expect(subject.send(:x_get_tree_roots, false)).to match_array([
                                                                    {:id => "r",  :text => "Reports",   :icon => "pficon pficon-folder-close", :tip => "Reports"},
                                                                    {:id => "c",  :text => "Charts",    :icon => "pficon pficon-folder-close", :tip => "Charts"},
                                                                    {:id => "m",  :text => "Menus",     :icon => "pficon pficon-folder-close", :tip => "Menus"}
                                                                  ])
  end

  it "#x_get_tree_custom_kids (private)" do
    widget1 = FactoryBot.create(:miq_widget)
    widget2 = FactoryBot.create(:miq_widget)
    FactoryBot.create(:miq_widget, :content_type => "menu")

    expect(subject.send(:x_get_tree_custom_kids, {:id => "-r"}, false, nil)).to match_array([widget1, widget2])
  end
end

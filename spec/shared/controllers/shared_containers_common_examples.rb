shared_examples :container_button_examples do |prefix|
  it "handles #{prefix}_tag" do
    expect(controller).to receive(:tag).with(controller.class.model)
    post :button, :params => { :pressed => "#{prefix}_tag" }
  end

  [ContainerReplicator, ContainerGroup, ContainerNode, ContainerImage].each do |model|
    it "handles #{model.name.underscore}_protect" do
      if controller.class.model == model
        expect(controller).to receive(:assign_policies)
        post :button, :params => { :pressed => "#{model.name.underscore}_protect" }
      end
    end

    it "handles #{model.name.underscore}_check_compliance" do
      if controller.class.model == model
        expect(controller).to receive(:check_compliance)
        post :button, :params => { :pressed => "#{model.name.underscore}_check_compliance" }
      end
    end
  end
end

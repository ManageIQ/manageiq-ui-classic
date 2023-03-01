describe ApplicationController do
  context "audit events" do
    it "#build_config_audit (private)" do
      edit = {:current => {:changing_value => "test",  :static_value => "same", :password => "pw1"},
              :new     => {:changing_value => "test2", :static_value => "same", :password => "pw2"}}
      expect(controller.send(:build_config_audit, edit))
        .to eq(:event   => "vmdb_config_update",
               :userid  => nil,
               :message => "VMDB config updated (changing_value:[test] to [test2], password:[********] to [********])")
    end

    it "#build_config_audit (private) password filtering" do
      edit = {:current => {:user_proxies => [{:ldapport => "389", :bind_pwd => "secret"}]},
              :new     => {:user_proxies => [{:ldapport => "636", :bind_pwd => "super_secret"}]}}
      expect(controller.send(:build_config_audit, edit))
        .to eq(:event   => "vmdb_config_update",
               :userid  => nil,
               :message => "VMDB config updated (user_proxies/0/ldapport:[389] to [636], user_proxies/0/bind_pwd:[********] to [********])")
    end

    it "#build_created_audit (private)" do
      category = FactoryBot.create(:classification)
      edit = {:new => {:name => "the-name", :changing_value => "test2", :static_value => "same",
                           :hash_value => {:h1 => "first", :h2 => "second", :hash_password => "pw1"},
                           :password => "pw1"}}
      expect(controller.send(:build_created_audit, category, edit))
        .to eq(:event        => "classification_record_add",
               :target_id    => category.id,
               :target_class => category.class.name,
               :userid       => nil,
               :message      => "[the-name] Record created (name:[the-name], changing_value:[test2], static_value:[same], hash_value/h1:[first], hash_value/h2:[second], hash_value/hash_password:[********], password:[********])")
    end

    it "#build_saved_audit (private)" do
      category = FactoryBot.create(:classification)
      edit = {:current => {:name => "the-name", :changing_value => "test",  :static_value => "same",
                           :hash_value => {:h1 => "first", :h2 => "second", :hash_password => "pw1"}},
              :new     => {:name => "the-name", :changing_value => "test2", :static_value => "same",
                           :hash_value => {:h1 => "firsts", :h2 => "seconds", :hash_password => "pw2"}}}
      expect(controller.send(:build_saved_audit, category, edit))
        .to eq(:event        => "classification_record_update",
               :target_id    => category.id,
               :target_class => category.class.name,
               :userid       => nil,
               :message      => "[the-name] Record updated (changing_value:[test] to [test2], hash_value/h1:[first] to [firsts], hash_value/h2:[second] to [seconds], hash_value/hash_password:[********] to [********])")
    end
  end
end

module TreeNode
  class MiqAeDomain < MiqAeNode
    include MiqAeClassHelper

    set_attribute(:image) { @object.try(:decorate).try(:fileicon) }

    def text
      title = super
      editable_domain = editable_domain?(@object)
      enabled_domain  = @object.enabled

      unless editable_domain && enabled_domain
        title = add_read_only_suffix(title, editable_domain, enabled_domain)
      end

      title
    end

    set_attribute(:klass) { @object.enabled? ? nil : 'opacity' }
  end
end

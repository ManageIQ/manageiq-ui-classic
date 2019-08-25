module TreeNode
  class MiqAeDomain < MiqAeNode
    include MiqAeClassHelper

    set_attributes(:icon, :image) do
      # Having a "flat" case here makes the code more readable
      # rubocop:disable LiteralAsCondition
      case true
      when @object.git_enabled?
        image = 'svg/ae_git_domain.svg'
      when @object.name == MiqAeDatastore::MANAGEIQ_DOMAIN
        icon = 'ff ff-manageiq'
      when !@object.top_level_namespace
        icon = 'fa fa-globe'
      else
        image = "svg/vendor-#{@object.top_level_namespace.downcase}.svg"
      end
      # rubocop:enable LiteralAsCondition
      [icon, image]
    end

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

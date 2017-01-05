module TreeNode
  class MiqAeNamespace < MiqAeNode
    include MiqAeClassHelper

    set_attribute(:image) do
      # Having a "flat" case here makes the code more readable
      # rubocop:disable LiteralInCondition
      case true
      when !@object.domain?
        'svg/ae_namespace.svg'
      when @object.git_enabled?
        'svg/ae_git_domain.svg'
      when @object.name == MiqAeDatastore::MANAGEIQ_DOMAIN
        '100/miq.png'
      when !@object.top_level_namespace
        '100/ae_domain.png'
      else
        "svg/vendor-#{@object.top_level_namespace.downcase}.svg"
      end
      # rubocop:enable LiteralInCondition
    end

    set_attribute(:klass) { @object.domain? && @object.enabled? ? nil : 'striketrough' }

    private

    def model
      @object.domain? ? 'MiqAeDomain' : super
    end

    def text
      title = super
      if @object.domain?
        editable_domain = editable_domain?(@object)
        enabled_domain  = @object.enabled

        unless editable_domain && enabled_domain
          title = add_read_only_suffix(title, editable_domain, enabled_domain)
        end
      end
      title
    end
  end
end

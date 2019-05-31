module TreeNode
  class Node
    attr_reader :tree

    def initialize(object, parent_id, options, tree)
      @object = object
      @parent_id = parent_id
      @options = options
      @tree = tree
    end

    def text
      @object.name
    end

    def tooltip
      nil
    end

    def image
      nil
    end

    def icon
      @object.try(:decorate).try(:fonticon)
    end

    def icon_background
      nil
    end

    def klass
      nil
    end

    def selectable
      true
    end

    def selected
      nil
    end

    def color
      nil
    end

    def checkable
      true
    end

    def expand
      false
    end

    def hide_checkbox
      nil
    end

    def key
      if @object.id.nil?
        # FIXME: this makes problems in tests
        # to handle "Unassigned groups" node in automate buttons tree
        "-#{@object.name.split('|').last}"
      else
        base_class = @object.class.base_model.name # i.e. Vm or MiqTemplate
        base_class = "Datacenter" if base_class == "EmsFolder" && @object.kind_of?(::Datacenter)
        base_class = "ManageIQ::Providers::Foreman::ConfigurationManager" if @object.kind_of?(ManageIQ::Providers::Foreman::ConfigurationManager)
        base_class = "ManageIQ::Providers::AnsibleTower::AutomationManager" if @object.kind_of?(ManageIQ::Providers::AnsibleTower::AutomationManager)
        prefix = TreeBuilder.get_prefix_for_model(base_class)
        cid = @object.id
        "#{@options[:full_ids] && @parent_id.present? ? "#{@parent_id}_" : ''}#{prefix}-#{cid}"
      end
    end

    def escape(string)
      return string if string.nil? || string.blank? || string.html_safe?
      ERB::Util.html_escape(string)
    end

    def to_h
      node = {
        :key            => key,
        :text           => escape(text),
        :tooltip        => escape(tooltip),
        :icon           => icon,
        :iconBackground => icon_background,
        :iconColor      => color,
        :expand         => expand,
        :hideCheckbox   => hide_checkbox,
        :addClass       => klass,
        :selectable     => selectable,
        :select         => selected,
        :checkable      => checkable ? nil : false,
      }

      node[:image] = if !image
                       nil
                     elsif image.start_with?("/")
                       image
                     elsif image =~ %r{^[a-zA-Z0-9]+/}
                       ActionController::Base.helpers.image_path(image)
                     end

      node.delete_if { |_, v| v.nil? }
    end

    class << self
      private

      def set_attribute(attribute, value = nil, &block)
        atvar = "@#{attribute}".to_sym

        define_method(attribute) do
          result = instance_variable_get(atvar)

          if result.nil?
            if block_given?
              args = [@object, @options, @parent_id].take(block.arity.abs)
              result = instance_exec(*args, &block)
            else
              result = value
            end
            instance_variable_set(atvar, result)
          end

          result
        end

        equals_method(attribute)
      end

      def set_attributes(*attributes, &block)
        attributes.each do |attribute|
          define_method(attribute) do
            result = instance_variable_get("@#{attribute}".to_sym)

            if result.nil?
              results = instance_eval(&block)
              attributes.each_with_index do |local, index|
                instance_variable_set("@#{local}".to_sym, results[index])
                result = results[index] if local == attribute
              end
            end

            result
          end

          equals_method(attribute)
        end
      end

      def equals_method(attribute)
        define_method("#{attribute}=".to_sym) do |result|
          instance_variable_set("@#{attribute}".to_sym, result)
        end
      end
    end
  end
end

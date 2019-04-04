module Mixins::CustomButtons
  Result = Struct.new(:plural_form) do
    def plural_form_matches(button)
      if plural_form == :list
        %w[list both].include?(button.options.try(:[], :display_for))

      else # :single
        [nil, 'single', 'both'].include?(button.options.try(:[], :display_for))

      end
    end
  end
end

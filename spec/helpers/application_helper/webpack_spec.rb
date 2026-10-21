describe ApplicationHelper::Webpack, :type => :helper do
  describe '#javascript_essential_dependencies' do
    before do
      allow(helper).to receive(:javascript_pack_tag).with('runtime').and_return('<script src="/packs/runtime.js"></script>'.html_safe)
      allow(helper).to receive(:javascript_pack_tag).with('shims').and_return('<script src="/packs/shims.js"></script>'.html_safe)
      allow(helper).to receive(:javascript_pack_tag).with('vendor').and_return('<script src="/packs/vendor.js"></script>'.html_safe)
    end

    it 'does not include a locale script when locale is en' do
      allow(FastGettext).to receive(:locale).and_return('en')
      output = helper.javascript_essential_dependencies

      expect(output).not_to include('/assets/')
      expect(output).to include('<script src="/packs/runtime.js"></script>')
      expect(output).to include('<script src="/packs/shims.js"></script>')
      expect(output).to include('<script src="/packs/vendor.js"></script>')
    end

    it 'does not include a locale script when locale asset is missing' do
      allow(FastGettext).to receive(:locale).and_return('missing_LOCALE')
      output = helper.javascript_essential_dependencies

      expect(output).not_to include('missing_LOCALE')
      expect(output).to include('<script src="/packs/runtime.js"></script>')
      expect(output).to include('<script src="/packs/shims.js"></script>')
      expect(output).to include('<script src="/packs/vendor.js"></script>')
    end

    it 'includes the locale script when locale is non-en and asset exists' do
      allow(FastGettext).to receive(:locale).and_return('ja')
      allow(helper).to receive(:resolve_asset_path).with('ja.js').and_return('ja.js')
      allow(helper).to receive(:javascript_include_tag).with('ja').and_return('<script src="/assets/ja.js"></script>'.html_safe)

      output = helper.javascript_essential_dependencies

      expect(output).to include('<script src="/assets/ja.js"></script>')
      expect(output).to include('<script src="/packs/runtime.js"></script>')
      expect(output).to include('<script src="/packs/shims.js"></script>')
      expect(output).to include('<script src="/packs/vendor.js"></script>')
    end
  end
end

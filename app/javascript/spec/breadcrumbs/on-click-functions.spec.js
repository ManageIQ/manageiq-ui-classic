import { onClickTree, onClick } from '../../components/breadcrumbs/on-click-functions';

describe('Breadcrumbs onClick functions', () => {
  describe('onClick', () => {
    it('calls e.prevent default', () => {
      const mockFn = jest.fn();
      window.miqCheckForChanges = jest.fn(() => false);

      onClick({ preventDefault: mockFn }, '/url');

      expect(mockFn).toHaveBeenCalled();
      expect(window.miqCheckForChanges).toHaveBeenCalled();

      window.miqCheckForChanges.mockClear();
    });

    it('change location', () => {
      const mockFn = jest.fn();
      window.miqCheckForChanges = () => true;

      onClick({ preventDefault: mockFn }, '/url');

      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('onClickTree', () => {
    it('returns null if no changes', () => {
      window.miqCheckForChanges = () => false;
      jest.spyOn(window, 'sendDataWithRx');

      const result = onClickTree();

      expect(result).toEqual(null);
      expect(window.sendDataWithRx).not.toHaveBeenCalled();
    });

    it('calls rxjs', () => {
      window.miqCheckForChanges = () => true;
      jest.spyOn(window, 'sendDataWithRx');

      onClickTree('pxe', { key: 'xx-11' });

      expect(window.sendDataWithRx).toHaveBeenCalledWith({
        breadcrumbSelect: {
          key: 'xx-11',
          path: '/pxe/tree_select',
        },
      });
    });
  });
});

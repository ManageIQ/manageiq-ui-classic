import { onClickTree, onClick } from '../../components/breadcrumbs/on-click-functions';

import '../helpers/miqAjax';

describe('Breadcrumbs onClick functions', () => {
  let preventDefaultMock;
  let event;
  let spyMiqAjax;

  beforeEach(() => {
    preventDefaultMock = jest.fn();
    event = {
      preventDefault: preventDefaultMock,
    };
    spyMiqAjax = jest.spyOn(window, 'miqAjax');
  });

  afterEach(() => {
    preventDefaultMock.mockRestore();
    spyMiqAjax.mockRestore();
  });

  describe('onClick', () => {
    it('calls e.prevent default', () => {
      window.miqCheckForChanges = jest.fn(() => false);

      onClick(event, 'url');

      expect(preventDefaultMock).toHaveBeenCalled();
      expect(window.miqCheckForChanges).toHaveBeenCalled();

      window.miqCheckForChanges.mockClear();
    });

    it('change location', () => {
      window.miqCheckForChanges = () => true;

      onClick(event, 'url');

      expect(preventDefaultMock).not.toHaveBeenCalled();
    });
  });

  describe('onClickTree', () => {
    const item = { key: 'xx-11', title: 'VM11' };

    it('not call miqAjax', () => {
      window.miqCheckForChanges = () => false;

      onClickTree(event, 'pxe', item);

      expect(preventDefaultMock).toHaveBeenCalled();
      expect(spyMiqAjax).not.toHaveBeenCalled();
    });

    it('calls tree_select', () => {
      window.miqCheckForChanges = () => true;

      onClickTree(event, 'pxe', item);

      expect(spyMiqAjax).toHaveBeenCalledWith(`/pxe/tree_select?id=${item.key}&text=${item.title}`, null, { beforeSend: true });
      expect(preventDefaultMock).not.toHaveBeenCalled();
    });
  });
});

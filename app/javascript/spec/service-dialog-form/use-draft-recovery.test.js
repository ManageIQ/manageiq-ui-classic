import useDraftRecovery from '../../components/service-dialog-form/use-draft-recovery';

describe('useDraftRecovery', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('key generation', () => {
    it('uses "service_dialog-new" key for action=new', () => {
      const { saveDraft } = useDraftRecovery('42', 'new');
      saveDraft({ label: 'test' });
      expect(sessionStorage.getItem('service_dialog-new')).toBe('{"label":"test"}');
    });

    it('uses "service_dialog-new" key for action=copy', () => {
      const { saveDraft } = useDraftRecovery('42', 'copy');
      saveDraft({ label: 'Copy of test' });
      expect(sessionStorage.getItem('service_dialog-new')).toBe('{"label":"Copy of test"}');
    });

    it('uses "service_dialog-{id}" key for action=edit', () => {
      const { saveDraft } = useDraftRecovery('99', 'edit');
      saveDraft({ label: 'Edited dialog' });
      expect(sessionStorage.getItem('service_dialog-99')).toBe('{"label":"Edited dialog"}');
    });
  });

  describe('saveDraft', () => {
    it('serialises data to sessionStorage', () => {
      const { saveDraft } = useDraftRecovery('1', 'edit');
      const data = { label: 'My Dialog', description: 'desc', dialog_tabs: [] };
      saveDraft(data);
      expect(sessionStorage.getItem('service_dialog-1')).toBe(JSON.stringify(data));
    });
  });

  describe('loadDraft', () => {
    it('returns null when no draft exists', () => {
      const { loadDraft } = useDraftRecovery('1', 'edit');
      expect(loadDraft()).toBeNull();
    });

    it('returns parsed data when draft exists', () => {
      const data = { label: 'Draft Dialog', dialog_tabs: [] };
      sessionStorage.setItem('service_dialog-1', JSON.stringify(data));
      const { loadDraft } = useDraftRecovery('1', 'edit');
      expect(loadDraft()).toEqual(data);
    });

    it('returns null for corrupt JSON', () => {
      sessionStorage.setItem('service_dialog-1', 'NOT_JSON{{{');
      const { loadDraft } = useDraftRecovery('1', 'edit');
      expect(loadDraft()).toBeNull();
    });
  });

  describe('clearDraft', () => {
    it('removes the draft from sessionStorage', () => {
      sessionStorage.setItem('service_dialog-1', JSON.stringify({ label: 'test' }));
      const { clearDraft } = useDraftRecovery('1', 'edit');
      clearDraft();
      expect(sessionStorage.getItem('service_dialog-1')).toBeNull();
    });

    it('does not throw when no draft exists', () => {
      const { clearDraft } = useDraftRecovery('1', 'edit');
      expect(() => clearDraft()).not.toThrow();
    });
  });

  describe('draft isolation', () => {
    it('edit draft does not collide with new/copy draft', () => {
      const { saveDraft: saveEdit } = useDraftRecovery('1', 'edit');
      const { saveDraft: saveNew } = useDraftRecovery('1', 'new');
      saveEdit({ label: 'Edit draft' });
      saveNew({ label: 'New draft' });
      expect(sessionStorage.getItem('service_dialog-1')).toBe('{"label":"Edit draft"}');
      expect(sessionStorage.getItem('service_dialog-new')).toBe('{"label":"New draft"}');
    });
  });
});

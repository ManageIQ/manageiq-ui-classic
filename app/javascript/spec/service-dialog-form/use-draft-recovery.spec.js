import useDraftRecovery from '../../components/service-dialog-form/use-draft-recovery';

// jsdom provides a real sessionStorage implementation — no mocking needed.

beforeEach(() => {
  sessionStorage.clear();
});

describe('useDraftRecovery — key generation', () => {
  it('uses "service_dialog-new" for action new', () => {
    const { saveDraft, loadDraft } = useDraftRecovery('', 'new');
    saveDraft({ label: 'test' });
    expect(sessionStorage.getItem('service_dialog-new')).not.toBeNull();
  });

  it('uses "service_dialog-new" for action copy', () => {
    const { saveDraft, loadDraft } = useDraftRecovery('42', 'copy');
    saveDraft({ label: 'test' });
    expect(sessionStorage.getItem('service_dialog-new')).not.toBeNull();
  });

  it('uses "service_dialog-{id}" for action edit', () => {
    const { saveDraft } = useDraftRecovery('42', 'edit');
    saveDraft({ label: 'test' });
    expect(sessionStorage.getItem('service_dialog-42')).not.toBeNull();
  });
});

describe('useDraftRecovery — saveDraft / loadDraft round-trip', () => {
  it('saves and loads data correctly', () => {
    const { saveDraft, loadDraft } = useDraftRecovery('', 'new');
    const data = { label: 'My Dialog', dialog_tabs: [] };
    saveDraft(data);
    expect(loadDraft()).toEqual(data);
  });

  it('returns null when no draft exists', () => {
    const { loadDraft } = useDraftRecovery('', 'new');
    expect(loadDraft()).toBeNull();
  });

  it('returns null when stored value is invalid JSON', () => {
    sessionStorage.setItem('service_dialog-new', 'not-json{{{');
    const { loadDraft } = useDraftRecovery('', 'new');
    expect(loadDraft()).toBeNull();
  });
});

describe('useDraftRecovery — clearDraft', () => {
  it('removes the draft from sessionStorage', () => {
    const { saveDraft, clearDraft, loadDraft } = useDraftRecovery('', 'new');
    saveDraft({ label: 'test' });
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it('does not throw when no draft exists', () => {
    const { clearDraft } = useDraftRecovery('', 'new');
    expect(() => clearDraft()).not.toThrow();
  });
});

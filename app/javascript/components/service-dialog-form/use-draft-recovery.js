/**
 * useDraftRecovery — session-storage draft persistence for ServiceDialogForm.
 *
 * Key schema (matches Angular: `'service_dialog-' + id`):
 *   new / copy  →  'service_dialog-new'
 *   edit        →  'service_dialog-{dialogId}'
 */
const useDraftRecovery = (id, action) => {
  const key = `service_dialog-${action === 'new' || action === 'copy' ? 'new' : id}`;

  const saveDraft = (data) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (_e) {
      // sessionStorage unavailable or quota exceeded — silently ignore
    }
  };

  const loadDraft = () => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  };

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(key);
    } catch (_e) {
      // ignore
    }
  };

  return { saveDraft, loadDraft, clearDraft };
};

export default useDraftRecovery;

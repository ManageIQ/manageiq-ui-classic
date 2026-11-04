/**
 * useDraftRecovery — session-storage draft persistence for ServiceDialogForm.
 *
 * Key schema:
 *   new   →  'service_dialog-new'
 *   copy  →  'service_dialog-copy-{sourceDialogId}'
 *   edit  →  'service_dialog-{dialogId}'
 */
const draftKeySuffix = (id, action) => {
  if (action === 'new') {
    return 'new';
  }
  return action === 'copy' ? `copy-${id}` : id;
};

const useDraftRecovery = (id, action) => {
  const key = `service_dialog-${draftKeySuffix(id, action)}`;

  const saveDraft = (data) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    } catch (_e) {
      // sessionStorage unavailable or quota exceeded — silently ignore
    }
  };

  const loadDraft = () => {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  };

  const clearDraft = () => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (_e) {
      // ignore
    }
  };

  return { saveDraft, loadDraft, clearDraft };
};

export default useDraftRecovery;

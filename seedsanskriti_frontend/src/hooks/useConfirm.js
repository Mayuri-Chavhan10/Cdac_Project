import { useCallback, useState } from 'react';

export default function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    variant: 'danger',
    resolve: null,
  });

  const requestConfirm = useCallback(
    ({ title = 'Please confirm', message, variant = 'danger' }) =>
      new Promise((resolve) => {
        setConfirmState({ open: true, title, message, variant, resolve });
      }),
    [],
  );

  const handleConfirm = useCallback(() => {
    confirmState.resolve?.(true);
    setConfirmState((prev) => ({ ...prev, open: false, resolve: null }));
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState.resolve?.(false);
    setConfirmState((prev) => ({ ...prev, open: false, resolve: null }));
  }, [confirmState]);

  return { confirmState, requestConfirm, handleConfirm, handleCancel };
}

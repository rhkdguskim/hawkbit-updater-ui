import { useState, useCallback, useMemo } from 'react';

type ModalStates<T extends string> = Record<T, boolean>;

/**
 * Hook for managing multiple modal states
 * @param initialModals - Object with modal names as keys and initial states as values
 * @returns Object with modal states and handlers
 *
 * @example
 * ```tsx
 * const { modals, openModal, closeModal, toggleModal, isOpen } = useModalStates({
 *   delete: false,
 *   edit: false,
 *   create: false,
 * });
 *
 * <Button onClick={() => openModal('delete')}>Delete</Button>
 * <DeleteModal open={modals.delete} onClose={() => closeModal('delete')} />
 * // or
 * <DeleteModal open={isOpen('delete')} onClose={() => closeModal('delete')} />
 * ```
 */
export const useModalStates = <T extends string>(
  initialModals: ModalStates<T>
) => {
  const [modals, setModals] = useState<ModalStates<T>>(initialModals);

  /**
   * Open a specific modal
   */
  const openModal = useCallback((name: T) => {
    setModals((prev) => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Close a specific modal
   */
  const closeModal = useCallback((name: T) => {
    setModals((prev) => ({ ...prev, [name]: false }));
  }, []);

  /**
   * Toggle a specific modal
   */
  const toggleModal = useCallback((name: T) => {
    setModals((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  /**
   * Close all modals
   */
  const closeAll = useCallback(() => {
    setModals((prev) => {
      const newState = {} as ModalStates<T>;
      Object.keys(prev).forEach((key) => {
        newState[key as T] = false;
      });
      return newState;
    });
  }, []);

  /**
   * Check if a specific modal is open
   */
  const isOpen = useCallback((name: T): boolean => {
    return modals[name] ?? false;
  }, [modals]);

  /**
   * Check if any modal is open
   */
  const hasOpenModal = useMemo(() => {
    return Object.values(modals).some((isOpen) => isOpen);
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAll,
    isOpen,
    hasOpenModal,
  };
};

/**
 * Hook for managing a single modal state
 * Simplified version for when you only need one modal
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModal();
 *
 * <Button onClick={open}>Open Modal</Button>
 * <MyModal open={isOpen} onClose={close} />
 * ```
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

import { StateCreator } from "zustand";
import { ModalState } from "./types";

const createModalSlice: StateCreator<ModalState> = (set) => ({
  modalContent: null,
  isModalOpen: false,

  openModal: (content) => set({ modalContent: content, isModalOpen: true }),

  closeModal: () => set({ isModalOpen: false }),
});

export default createModalSlice;

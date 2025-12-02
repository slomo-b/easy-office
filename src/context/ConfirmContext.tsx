import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [resolveRef, setResolveRef] = useState<(value: boolean) => void>(() => {});

  const confirm = (opts: ConfirmOptions | string) => {
    const finalOptions = typeof opts === 'string' ? { message: opts } : opts;
    setOptions({
        title: 'Bestätigung erforderlich',
        confirmText: 'Löschen',
        cancelText: 'Abbrechen',
        type: 'danger',
        ...finalOptions
    });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal 
        isOpen={isOpen} 
        onClose={handleCancel} 
        backdrop="blur" 
        classNames={{
          base: "bg-[#111B22] border border-[#1E2A36]",
          header: "border-b border-[#1E2A36] text-[#E2E8F0]",
          body: "py-6 text-[#94A3B8]",
          footer: "border-t border-[#1E2A36]",
          closeButton: "hover:bg-[#1E2A36] text-[#94A3B8]"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {options.title}
              </ModalHeader>
              <ModalBody>
                <p>{options.message}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={handleCancel} className="border-[#2A3C4D] text-[#94A3B8] hover:text-[#E2E8F0]">
                  {options.cancelText}
                </Button>
                <Button 
                    color={options.type === 'danger' ? 'danger' : 'primary'} 
                    onPress={handleConfirm}
                    className={options.type === 'danger' ? "bg-[#EF4444] text-white shadow-lg shadow-red-500/20" : "bg-[#00E5FF] text-black shadow-lg shadow-cyan-500/20"}
                >
                  {options.confirmText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

import { Button } from "../Button";
import { Modal, ModalContent, Input, TextArea, ModalButtons } from "../shared/SharedStyles";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  formData: { name: string; description: string };
  onFormChange: (data: { name: string; description: string }) => void;
  isCreating: boolean;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  isCreating
}: CreateFolderModalProps) {
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Create New Folder</h3>
        <Input
          type="text"
          placeholder="Folder name"
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
        />
        <TextArea
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
        />
        <ModalButtons>
          <Button $secondary onClick={onClose}>
            Cancel
          </Button>
          <Button $primary onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Folder'}
          </Button>
        </ModalButtons>
      </ModalContent>
    </Modal>
  );
}
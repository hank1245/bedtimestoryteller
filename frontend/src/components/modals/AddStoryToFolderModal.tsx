import styled from "styled-components";
import { Button } from "../Button";
import { Modal, ModalContent, ModalButtons } from "../shared/SharedStyles";

const StorySelectionItem = styled.div<{ $selected: boolean }>`
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.$selected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.$selected ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'};
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$selected ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.06)'};
  }
`;

interface Story {
  id: number;
  title: string;
  created_at: string;
}

interface AddStoryToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  stories: Story[];
  selectedStories: number[];
  onToggleStory: (storyId: number) => void;
  isAdding: boolean;
}

export default function AddStoryToFolderModal({
  isOpen,
  onClose,
  onSubmit,
  stories,
  selectedStories,
  onToggleStory,
  isAdding
}: AddStoryToFolderModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Add Stories to Folder</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
          Select stories to add to the folder:
        </p>
        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 20 }}>
          {stories.map((story) => (
            <StorySelectionItem
              key={story.id}
              $selected={selectedStories.includes(story.id)}
              onClick={() => onToggleStory(story.id)}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>{story.title}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                {new Date(story.created_at).toLocaleDateString()}
              </div>
            </StorySelectionItem>
          ))}
        </div>
        <ModalButtons>
          <Button $secondary onClick={onClose}>
            Cancel
          </Button>
          <Button
            $primary
            onClick={onSubmit}
            disabled={selectedStories.length === 0 || isAdding}
          >
            {isAdding ? 'Adding...' : `Add ${selectedStories.length} Stories`}
          </Button>
        </ModalButtons>
      </ModalContent>
    </Modal>
  );
}
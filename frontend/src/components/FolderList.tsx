import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "./Button";
import { 
  ListContainer, 
  EmptyStateContainer, 
  EmptyStateEmoji, 
  EmptyStateTitle, 
  EmptyStateSubtitle 
} from "./shared/SharedStyles";
import StoryLoading from "./StoryLoading";
import { Folder } from "../hooks/useFolders";

const AddFolderButton = styled(Button)`
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const FolderItem = styled.div`
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255,255,255,0.06);
    transform: translateY(-2px);
  }
`;

const FolderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FolderName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
`;

const FolderDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
`;

interface FolderListProps {
  folders: Folder[];
  loading: boolean;
  onCreateFolder: () => void;
  onAddStoriesToFolder: (folderId: number) => void;
}

export default function FolderList({ 
  folders, 
  loading, 
  onCreateFolder, 
  onAddStoriesToFolder 
}: FolderListProps) {
  const navigate = useNavigate();

  const handleFolderClick = (folderId: number) => {
    navigate(`/app/folder/${folderId}`);
  };

  return (
    <ListContainer>
      <AddFolderButton $secondary onClick={onCreateFolder}>
        <span>📁</span> Add New Folder
      </AddFolderButton>
      
      {loading ? (
        <StoryLoading subtext="Loading folders..." />
      ) : folders.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateEmoji>📁</EmptyStateEmoji>
          <EmptyStateTitle>No Folders Yet</EmptyStateTitle>
          <EmptyStateSubtitle>
            Create your first folder to organize your stories!
          </EmptyStateSubtitle>
        </EmptyStateContainer>
      ) : (
        <div>
          {folders.map((folder) => (
            <FolderItem key={folder.id} onClick={() => handleFolderClick(folder.id)}>
              <FolderHeader>
                <FolderName>{folder.name}</FolderName>
                <Button
                  $secondary
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddStoriesToFolder(folder.id);
                  }}
                >
                  Add Stories
                </Button>
              </FolderHeader>
              {folder.description && (
                <FolderDescription>{folder.description}</FolderDescription>
              )}
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
                Created: {new Date(folder.created_at).toLocaleDateString()}
              </div>
            </FolderItem>
          ))}
        </div>
      )}
    </ListContainer>
  );
}
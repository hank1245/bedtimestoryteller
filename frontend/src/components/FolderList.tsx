import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "./shared/Button";
import {
  ListContainer,
  EmptyStateContainer,
  EmptyStateEmoji,
  EmptyStateTitle,
  EmptyStateSubtitle,
  scrollableContainerStyles,
} from "./shared/SharedStyles";
import StoryLoading from "./story/StoryLoading";
import { Folder } from "../hooks/useFolders";
import { useMemo } from "react";
import { useRoutePrefetch } from "../hooks/useRoutePrefetch";

const AddFolderButton = styled(Button)`
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const FolderListContainer = styled.ul`
  ${scrollableContainerStyles}
`;

const FolderItem = styled.li`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
`;

const FolderCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
`;

const FolderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FolderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DeleteButton = styled(Button)`
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
  width: auto;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
    transform: translateY(-1px);
  }
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

const AddStoriesButton = styled(Button)`
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
  width: auto;
  white-space: nowrap;
`;

interface FolderListProps {
  folders: Folder[];
  loading: boolean;
  onCreateFolder: () => void;
  onAddStoriesToFolder: (folderId: number) => void;
  onDeleteFolder: (folderId: number) => void;
  isDeleting?: boolean;
}

export default function FolderList({
  folders,
  loading,
  onCreateFolder,
  onAddStoriesToFolder,
  onDeleteFolder,
  isDeleting = false,
}: FolderListProps) {
  const navigate = useNavigate();
  const prefetchFolder = useRoutePrefetch("folder");

  const handleFolderClick = (folderId: number) => {
    navigate(`/app/folder/${folderId}`);
  };

  return (
    <ListContainer>
      <AddFolderButton $secondary onClick={onCreateFolder} aria-label="Add new folder">
        <span>📁</span> Add New Folder
      </AddFolderButton>

      {loading ? (
        <StoryLoading subtext="Loading folders..." />
      ) : folders.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateEmoji aria-hidden>📁</EmptyStateEmoji>
          <EmptyStateTitle>No Folders Yet</EmptyStateTitle>
          <EmptyStateSubtitle>
            Create your first folder to organize your stories!
          </EmptyStateSubtitle>
        </EmptyStateContainer>
      ) : (
        <FolderListContainer role="list">
          {useMemo(
            () =>
              folders.map((folder) => (
                <FolderItem
                  key={folder.id}
                >
                  <button
                    type="button"
                    onClick={() => handleFolderClick(folder.id)}
                    onMouseEnter={prefetchFolder.onMouseEnter}
                    onFocus={prefetchFolder.onFocus}
                    onTouchStart={prefetchFolder.onTouchStart}
                    aria-label={`Open folder: ${folder.name}`}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <FolderCard>
                      <FolderHeader>
                        <FolderName>{folder.name}</FolderName>
                        <FolderActions>
                          <AddStoriesButton
                            $secondary
                            $small
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddStoriesToFolder(folder.id);
                            }}
                            aria-label={`Add stories to folder: ${folder.name}`}
                            onMouseEnter={prefetchFolder.onMouseEnter}
                            onFocus={prefetchFolder.onFocus}
                            onTouchStart={prefetchFolder.onTouchStart}
                          >
                            Add Stories
                          </AddStoriesButton>
                          <DeleteButton
                            $small
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFolder(folder.id);
                            }}
                            aria-label={`Delete folder: ${folder.name}`}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </DeleteButton>
                        </FolderActions>
                      </FolderHeader>
                      {folder.description && (
                        <FolderDescription>{folder.description}</FolderDescription>
                      )}
                      <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
                        Created: {new Date(folder.created_at).toLocaleDateString()}
                      </div>
                    </FolderCard>
                  </button>
                </FolderItem>
              )),
            [folders, isDeleting]
          )}
        </FolderListContainer>
      )}
    </ListContainer>
  );
}

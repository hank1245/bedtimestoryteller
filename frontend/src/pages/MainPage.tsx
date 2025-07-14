import { useEffect, useState } from "react";
import { useStories } from "../hooks/useStories";
import { useFolders, useCreateFolder, useAddStoryToFolder } from "../hooks/useFolders";
import { useToast } from "../stores/toastStore";
import PageContainer from "../components/shared/PageContainer";
import TabNavigation from "../components/TabNavigation";
import StoryList from "../components/StoryList";
import FolderList from "../components/FolderList";
import CreateFolderModal from "../components/modals/CreateFolderModal";
import AddStoryToFolderModal from "../components/modals/AddStoryToFolderModal";
import { Button } from "../components/Button";
import styled from "styled-components";
import { CardHeader, CardTitle, CardSubtitle } from "../components/Card";

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledCardHeader = styled(CardHeader)`
  margin-top: 20px;

  @media (max-width: 480px) {
    margin-top: 30px;
  }
`;

export default function MainPage({ onCreate }: { onCreate: () => void }) {
  const { addToast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState<'all' | 'folders'>('all');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedStories, setSelectedStories] = useState<number[]>([]);
  const [folderForm, setFolderForm] = useState({ name: '', description: '' });

  // React Query hooks
  const { data: stories = [], isLoading: storiesLoading, error: storiesError } = useStories();
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const createFolderMutation = useCreateFolder();
  const addStoryToFolderMutation = useAddStoryToFolder();

  // Event handlers
  const handleCreateFolder = async () => {
    if (!folderForm.name.trim()) {
      addToast('error', 'Folder name is required');
      return;
    }

    try {
      await createFolderMutation.mutateAsync(folderForm);
      setShowCreateFolderModal(false);
      setFolderForm({ name: '', description: '' });
      addToast('success', 'Folder created successfully');
    } catch (error) {
      addToast('error', 'Failed to create folder');
    }
  };

  const handleAddStoriesToFolder = async () => {
    if (!selectedFolder || selectedStories.length === 0) {
      addToast('error', 'Please select stories to add');
      return;
    }

    try {
      for (const storyId of selectedStories) {
        await addStoryToFolderMutation.mutateAsync({ folderId: selectedFolder, storyId });
      }
      setShowAddStoryModal(false);
      setSelectedStories([]);
      setSelectedFolder(null);
      addToast('success', 'Stories added to folder successfully');
    } catch (error) {
      addToast('error', 'Failed to add stories to folder');
    }
  };

  const handleAddStoriesToFolderClick = (folderId: number) => {
    setSelectedFolder(folderId);
    setShowAddStoryModal(true);
  };

  const toggleStorySelection = (storyId: number) => {
    setSelectedStories(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const closeAddStoryModal = () => {
    setShowAddStoryModal(false);
    setSelectedStories([]);
    setSelectedFolder(null);
  };

  // Error handling
  useEffect(() => {
    if (storiesError) {
      addToast("error", "Failed to load stories");
    }
  }, [storiesError, addToast]);

  return (
    <PageContainer
      backgroundProps={{
        intensity: 0.4,
        moonPosition: [5, 6, -10],
        starsCount: 100,
      }}
      topBarProps={{
        showSettings: true,
      }}
    >
      <ContentWrapper>
        <StyledCardHeader>
          <CardTitle>
            <span className="emoji-color">📚</span> Your Bedtime Stories
          </CardTitle>
          <CardSubtitle>
            {activeTab === 'all' 
              ? 'Here are your previously created stories.' 
              : 'Organize your stories into folders.'
            }
          </CardSubtitle>
        </StyledCardHeader>
        
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'all' ? (
          <StoryList 
            stories={stories} 
            loading={storiesLoading} 
            error={storiesError} 
          />
        ) : (
          <FolderList
            folders={folders}
            loading={foldersLoading}
            onCreateFolder={() => setShowCreateFolderModal(true)}
            onAddStoriesToFolder={handleAddStoriesToFolderClick}
          />
        )}
      </ContentWrapper>
      
      <Button $primary onClick={onCreate} style={{ bottom: -30 }}>
        Create Another Story
      </Button>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onSubmit={handleCreateFolder}
        formData={folderForm}
        onFormChange={setFolderForm}
        isCreating={createFolderMutation.isPending}
      />

      <AddStoryToFolderModal
        isOpen={showAddStoryModal}
        onClose={closeAddStoryModal}
        onSubmit={handleAddStoriesToFolder}
        stories={stories}
        selectedStories={selectedStories}
        onToggleStory={toggleStorySelection}
        isAdding={addStoryToFolderMutation.isPending}
      />

      {/* 이모지 컬러 강제 스타일 */}
      <style>{`
        .emoji-color {
          color: initial !important;
          -webkit-text-fill-color: initial !important;
          filter: none !important;
          opacity: 1 !important;
          mix-blend-mode: normal !important;
          display: inline-block;
        }
      `}</style>
    </PageContainer>
  );
}
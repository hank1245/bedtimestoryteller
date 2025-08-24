import styled from "styled-components";

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  color: ${(props) =>
    props.$active ? "var(--text-primary)" : "var(--text-secondary)"};
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  cursor: pointer;
  border-bottom: 2px solid
    ${(props) => (props.$active ? "#ffffff" : "transparent")};
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }
`;

interface TabNavigationProps {
  activeTab: "all" | "folders";
  onTabChange: (tab: "all" | "folders") => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <TabContainer>
      <Tab $active={activeTab === "all"} onClick={() => onTabChange("all")}>
        All Stories
      </Tab>
      <Tab
        $active={activeTab === "folders"}
        onClick={() => onTabChange("folders")}
      >
        Folders
      </Tab>
    </TabContainer>
  );
}

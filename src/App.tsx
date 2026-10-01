import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DocumentsView } from './components/DocumentsView';
import { SharedWithMeView } from './components/SharedWithMeView';
import { StarredView } from './components/StarredView';
import { TemplatesView } from './components/TemplatesView';
import { TrashView } from './components/TrashView';
import { BackupRecoveryView } from './components/BackupRecoveryView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { GoogleDriveLiveView } from './components/GoogleDriveLiveView';
import { LoginModal } from './components/LoginModal';
import { ForcePasswordChangeModal } from './components/ForcePasswordChangeModal';
import { UploadModal } from './components/UploadModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { ShareModal } from './components/ShareModal';
import { NewVersionModal } from './components/NewVersionModal';
import { FileViewerModal } from './components/FileViewerModal';
import { DocumentFile, Folder } from './types';

function MainLayout() {
  const {
    currentUser,
    activeFile,
    setActiveFile,
    categories
  } = useApp();

  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('all_docs');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | null>(null);

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null);

  const [shareTargetFile, setShareTargetFile] = useState<DocumentFile | null>(null);
  const [shareTargetFolder, setShareTargetFolder] = useState<Folder | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [newVersionFile, setNewVersionFile] = useState<DocumentFile | null>(null);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);

  // Handlers
  const handleOpenUploadModal = (folderId?: string | null) => {
    setUploadTargetFolderId(folderId || null);
    setIsUploadModalOpen(true);
  };

  const handleOpenCreateFolderModal = (folderId?: string | null) => {
    setCreateFolderParentId(folderId || null);
    setIsCreateFolderModalOpen(true);
  };

  const handleOpenShareModal = (file?: DocumentFile, folder?: Folder) => {
    setShareTargetFile(file || null);
    setShareTargetFolder(folder || null);
    setIsShareModalOpen(true);
  };

  const handleOpenUploadNewVersion = (file: DocumentFile) => {
    setNewVersionFile(file);
    setIsNewVersionModalOpen(true);
  };

  const handleOpenFileViewer = (file: DocumentFile) => {
    setActiveFile(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Login Modal */}
      <LoginModal />

      {/* Force Change Password Modal */}
      <ForcePasswordChangeModal />

      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategoryId || ''}
        setSelectedCategory={(catId) => setSelectedCategoryId(catId || null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* App Body: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          onOpenUploadModal={() => handleOpenUploadModal(null)}
          onOpenCreateFolderModal={() => handleOpenCreateFolderModal(null)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'all_docs' && (
            <DocumentsView
              searchQuery={searchQuery}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              onOpenUploadModal={handleOpenUploadModal}
              onOpenCreateFolderModal={handleOpenCreateFolderModal}
              onOpenShareModal={handleOpenShareModal}
              onOpenUploadNewVersionModal={handleOpenUploadNewVersion}
              onOpenFileViewer={handleOpenFileViewer}
            />
          )}

          {activeTab === 'google_drive' && <GoogleDriveLiveView />}

          {activeTab === 'shared_with_me' && (
            <SharedWithMeView
              onOpenFileViewer={handleOpenFileViewer}
              onOpenShareModal={(file) => handleOpenShareModal(file)}
            />
          )}

          {activeTab === 'starred' && (
            <StarredView
              onOpenFileViewer={handleOpenFileViewer}
              onOpenShareModal={(file) => handleOpenShareModal(file)}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView onOpenFileViewer={handleOpenFileViewer} />
          )}

          {activeTab === 'trash' && <TrashView />}

          {activeTab === 'backup' && <BackupRecoveryView />}

          {activeTab === 'admin' && <AdminConsoleView />}
        </main>
      </div>

      {/* Dialog Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultCategoryId={selectedCategoryId || categories[0]?.id}
        defaultFolderId={uploadTargetFolderId}
      />

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        defaultCategoryId={selectedCategoryId || categories[0]?.id}
        defaultParentFolderId={createFolderParentId}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareTargetFile(null);
          setShareTargetFolder(null);
        }}
        file={shareTargetFile}
        folder={shareTargetFolder}
      />

      <NewVersionModal
        isOpen={isNewVersionModalOpen}
        onClose={() => {
          setIsNewVersionModalOpen(false);
          setNewVersionFile(null);
        }}
        file={newVersionFile}
      />

      <FileViewerModal
        file={activeFile}
        onClose={() => setActiveFile(null)}
        onOpenShareModal={(f) => handleOpenShareModal(f)}
        onOpenUploadNewVersionModal={(f) => handleOpenUploadNewVersion(f)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

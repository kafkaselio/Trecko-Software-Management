import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  Folder, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  PlusCircle, 
  Check, 
  X,
  Package,
  Grid
} from 'lucide-react';
import { Doc, Theme } from '../types';

interface WikiSystemProps {
  docs: Doc[];
  activeDocId: string;
  onSetActiveDocId: (id: string) => void;
  onSaveDoc: (doc: Doc) => void;
  onCreateDoc: () => void;
  onAiEditWikiDoc: (action: string) => void;
  theme: Theme;
}

export default function WikiSystem({
  docs,
  activeDocId,
  onSetActiveDocId,
  onSaveDoc,
  onCreateDoc,
  onAiEditWikiDoc,
  theme,
}: WikiSystemProps) {
  const [docSearch, setDocSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Structural Categorization Lists (Folders & Sections)
  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem('wiki_folders_list');
    return saved ? JSON.parse(saved) : ['General Specifications', 'Development Blueprints', 'Design Prototypes'];
  });

  const [sections, setSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('wiki_sections_list');
    return saved ? JSON.parse(saved) : ['Active Drafts', 'Production Specifications', 'Archived Reference'];
  });

  // New Structural Categorization Lists (Boxes & Collections)
  const [boxes, setBoxes] = useState<string[]>(() => {
    const saved = localStorage.getItem('wiki_boxes_list');
    return saved ? JSON.parse(saved) : ['Main Launch Box', 'Quality Assurance Box', 'Reference Coordinates'];
  });

  const [collections, setCollections] = useState<string[]>(() => {
    const saved = localStorage.getItem('wiki_collections_list');
    return saved ? JSON.parse(saved) : ['API Endpoints', 'UX Mockups', 'Architecture Diagrams'];
  });

  // Track collapsed groupings
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [collapsedBoxes, setCollapsedBoxes] = useState<Record<string, boolean>>({});

  // Active view mode in the explorer sidebar
  const [explorerViewMode, setExplorerViewMode] = useState<'folders' | 'boxes'>('folders');

  // Popup creators state
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [folderInput, setFolderInput] = useState('');

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [sectionInput, setSectionInput] = useState('');

  const [isAddingBox, setIsAddingBox] = useState(false);
  const [boxInput, setBoxInput] = useState('');

  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [collectionInput, setCollectionInput] = useState('');

  // Persist structural configurations
  useEffect(() => {
    localStorage.setItem('wiki_folders_list', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('wiki_sections_list', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('wiki_boxes_list', JSON.stringify(boxes));
  }, [boxes]);

  useEffect(() => {
    localStorage.setItem('wiki_collections_list', JSON.stringify(collections));
  }, [collections]);

  const currentDoc = docs.find(d => d.id === activeDocId) || docs[0];

  const handleTitleChange = (newTitle: string) => {
    if (!currentDoc) return;
    onSaveDoc({ ...currentDoc, title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    if (!currentDoc) return;
    onSaveDoc({ ...currentDoc, content: newContent });
  };

  const handleCategoryChange = (val: string) => {
    if (!currentDoc) return;
    onSaveDoc({ ...currentDoc, category: val });
  };

  const handleFolderChange = (val: string) => {
    if (!currentDoc) return;
    onSaveDoc({ ...currentDoc, folder: val || undefined });
  };

  const handleSectionChange = (val: string) => {
    if (!currentDoc) return;
    onSaveDoc({ ...currentDoc, section: val || undefined });
  };

  const handleBoxChange = (val: string) => {
    if (!currentDoc) return;
    onSaveDoc({ ...currentDoc, box: val || undefined });
  };

  const handleCollectionChange = (val: string) => {
    if (!currentDoc) return;
    onSaveDoc({ ...currentDoc, collection: val || undefined });
  };

  // Add handlers
  const addNewFolder = () => {
    const trimmed = folderInput.trim();
    if (trimmed && !folders.includes(trimmed)) {
      setFolders(prev => [...prev, trimmed]);
      setFolderInput('');
      setIsAddingFolder(false);
    }
  };

  const addNewSection = () => {
    const trimmed = sectionInput.trim();
    if (trimmed && !sections.includes(trimmed)) {
      setSections(prev => [...prev, trimmed]);
      setSectionInput('');
      setIsAddingSection(false);
    }
  };

  const addNewBox = () => {
    const trimmed = boxInput.trim();
    if (trimmed && !boxes.includes(trimmed)) {
      setBoxes(prev => [...prev, trimmed]);
      setBoxInput('');
      setIsAddingBox(false);
    }
  };

  const addNewCollection = () => {
    const trimmed = collectionInput.trim();
    if (trimmed && !collections.includes(trimmed)) {
      setCollections(prev => [...prev, trimmed]);
      setCollectionInput('');
      setIsAddingCollection(false);
    }
  };

  const toggleFolderCollapse = (folderName: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const toggleBoxCollapse = (boxName: string) => {
    setCollapsedBoxes(prev => ({
      ...prev,
      [boxName]: !prev[boxName]
    }));
  };

  // Filter docs matching search query
  const filteredDocs = docs.filter(d =>
    d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
    (d.category && d.category.toLowerCase().includes(docSearch.toLowerCase())) ||
    (d.folder && d.folder.toLowerCase().includes(docSearch.toLowerCase())) ||
    (d.section && d.section.toLowerCase().includes(docSearch.toLowerCase())) ||
    (d.box && d.box.toLowerCase().includes(docSearch.toLowerCase())) ||
    (d.collection && d.collection.toLowerCase().includes(docSearch.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-175px)] flex border border-white/5 rounded-2xl overflow-hidden bg-[#0a0a0c]">
      
      {/* 1. Left Documents Tree Panel */}
      <aside className="w-72 border-r border-white/5 bg-[#0C0C0C]/50 flex flex-col shrink-0 text-xs p-3.5 space-y-4">
        
        {/* Title and Adding Tools */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1aa]">Notion Explorer</p>
            <div className="flex space-x-1 items-center">
              <button 
                onClick={() => {
                  setIsAddingFolder(true);
                  setIsAddingSection(false);
                  setIsAddingBox(false);
                  setIsAddingCollection(false);
                }} 
                className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white" 
                title="Add New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  setIsAddingSection(true);
                  setIsAddingFolder(false);
                  setIsAddingBox(false);
                  setIsAddingCollection(false);
                }} 
                className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white" 
                title="Add New Section"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  setIsAddingBox(true);
                  setIsAddingFolder(false);
                  setIsAddingSection(false);
                  setIsAddingCollection(false);
                }} 
                className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white font-bold" 
                title="Add New Box"
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
              </button>
              <button 
                onClick={() => {
                  setIsAddingCollection(true);
                  setIsAddingFolder(false);
                  setIsAddingSection(false);
                  setIsAddingBox(false);
                }} 
                className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white" 
                title="Add New Collection"
              >
                <Grid className="w-3.5 h-3.5 text-[#daff33]" />
              </button>
            </div>
          </div>

          {/* Group View Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-lg select-none">
            <button
              onClick={() => setExplorerViewMode('folders')}
              className={`py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                explorerViewMode === 'folders' 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/10' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              📁 Folders
            </button>
            <button
              onClick={() => setExplorerViewMode('boxes')}
              className={`py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                explorerViewMode === 'boxes' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              📦 Boxes & Collections
            </button>
          </div>
        </div>

        {/* Inline Folder Creator popup */}
        {isAddingFolder && (
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-indigo-500/20 space-y-2 animate-fade-in text-[10px]">
            <span className="font-bold text-indigo-400 uppercase tracking-widest block text-[9px]">CREATE NEW FOLDER</span>
            <input
              type="text"
              placeholder="Folder label..."
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              className="w-full h-7 px-2 border border-white/10 bg-black/40 rounded text-[10px] text-white focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') addNewFolder(); }}
              autoFocus
            />
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setIsAddingFolder(false)} className="px-2 py-1 bg-white/5 rounded hover:bg-white/10 text-white/55">Cancel</button>
              <button onClick={addNewFolder} className="px-2 py-1 bg-indigo-600 rounded hover:bg-indigo-500 text-white">Create</button>
            </div>
          </div>
        )}

        {/* Inline Section Creator popup */}
        {isAddingSection && (
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-indigo-500/20 space-y-2 animate-fade-in text-[10px]">
            <span className="font-bold text-indigo-400 uppercase tracking-widest block text-[9px]">CREATE NEW SECTION</span>
            <input
              type="text"
              placeholder="Section label..."
              value={sectionInput}
              onChange={(e) => setSectionInput(e.target.value)}
              className="w-full h-7 px-2 border border-white/10 bg-black/40 rounded text-[10px] text-white focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') addNewSection(); }}
              autoFocus
            />
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setIsAddingSection(false)} className="px-2 py-1 bg-white/5 rounded hover:bg-white/10 text-white/55">Cancel</button>
              <button onClick={addNewSection} className="px-2 py-1 bg-indigo-600 rounded hover:bg-indigo-500 text-white">Create</button>
            </div>
          </div>
        )}

        {/* Inline Box Creator Popup */}
        {isAddingBox && (
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-amber-500/20 space-y-2 animate-fade-in text-[10px]">
            <span className="font-bold text-amber-400 uppercase tracking-widest block text-[9px]">CREATE NEW BOX</span>
            <input
              type="text"
              placeholder="Box label..."
              value={boxInput}
              onChange={(e) => setBoxInput(e.target.value)}
              className="w-full h-7 px-2 border border-white/10 bg-black/40 rounded text-[10px] text-white focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') addNewBox(); }}
              autoFocus
            />
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setIsAddingBox(false)} className="px-2 py-1 bg-white/5 rounded hover:bg-white/10 text-white/55">Cancel</button>
              <button onClick={addNewBox} className="px-2 py-1 bg-amber-600 rounded hover:bg-amber-500 text-white">Create</button>
            </div>
          </div>
        )}

        {/* Inline Collection Creator Popup */}
        {isAddingCollection && (
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-[#daff33]/20 space-y-2 animate-fade-in text-[10px]">
            <span className="font-bold text-[#daff33] uppercase tracking-widest block text-[9px]">CREATE NEW COLLECTION</span>
            <input
              type="text"
              placeholder="Collection label..."
              value={collectionInput}
              onChange={(e) => setCollectionInput(e.target.value)}
              className="w-full h-7 px-2 border border-white/10 bg-black/40 rounded text-[10px] text-white focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') addNewCollection(); }}
              autoFocus
            />
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setIsAddingCollection(false)} className="px-2 py-1 bg-white/5 rounded hover:bg-white/10 text-white/55">Cancel</button>
              <button onClick={addNewCollection} className="px-2 py-1 bg-[#daff33] rounded hover:bg-[#cbf026] text-black font-semibold">Create</button>
            </div>
          </div>
        )}
        
        {/* Search Input */}
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-white/30" />
          <input
            type="text"
            placeholder="Search wiki spec..."
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
            className="w-full text-[10px] h-7.5 pl-8 pr-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-[#1c1c22]"
          />
        </div>

        {/* Documents tree list */}
        <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar pr-0.5">
          
          {explorerViewMode === 'folders' ? (
            // FOLDERS VIEW MODE
            folders.map(fName => {
              const folderDocs = filteredDocs.filter(d => d.folder === fName);
              const isCollapsed = collapsedFolders[fName];

              return (
                <div key={fName} className="space-y-1.5">
                  <button
                    onClick={() => toggleFolderCollapse(fName)}
                    className="w-full flex items-center justify-between text-[#8a8a93] hover:text-white transition-colors py-1 group"
                  >
                    <div className="flex items-center space-x-1.5 font-bold tracking-wide text-[10.5px]">
                      <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{fName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[8px] bg-white/5 text-white/40 group-hover:bg-white/10 px-1 rounded-sm">{folderDocs.length}</span>
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="pl-3 border-l border-white/5 space-y-2 mt-1 animate-fade-in">
                      {sections.map(sName => {
                        const sectionDocs = folderDocs.filter(d => d.section === sName);
                        if (sectionDocs.length === 0) return null;

                        return (
                          <div key={sName} className="space-y-0.5 mt-1.5">
                            <span className="text-[8px] font-mono tracking-widest text-zinc-500 hover:text-zinc-400 uppercase font-black block pl-1 flex items-center mb-0.5 select-none">
                              <Layers className="w-2.5 h-2.5 opacity-55 mr-1" />
                              {sName}
                            </span>
                            
                            {sectionDocs.map(d => (
                              <button
                                key={d.id}
                                onClick={() => {
                                  onSetActiveDocId(d.id);
                                  setIsEditing(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-1.5 transition-all cursor-pointer ${
                                  activeDocId === d.id 
                                    ? 'bg-indigo-600/15 text-white font-bold border-l-2 border-[#daff33]' 
                                    : 'hover:bg-white/[0.02] text-white/50 border-l border-transparent'
                                }`}
                              >
                                <FileText className="w-3 h-3 text-white/20 shrink-0" />
                                <span className="truncate text-[10.5px]">{d.title}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })}

                      {/* Display un-sectioned docs inside folders */}
                      {folderDocs.filter(d => !d.section).length > 0 && (
                        <div className="space-y-0.5 pt-1">
                          {folderDocs.filter(d => !d.section).map(d => (
                            <button
                              key={d.id}
                              onClick={() => {
                                  onSetActiveDocId(d.id);
                                  setIsEditing(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-1.5 transition-all cursor-pointer ${
                                activeDocId === d.id 
                                  ? 'bg-indigo-600/15 text-white font-bold border-l-2 border-[#daff33]' 
                                  : 'hover:bg-white/[0.02] text-white/50 border-l border-transparent'
                              }`}
                            >
                              <FileText className="w-3 h-3 text-white/20 shrink-0" />
                              <span className="truncate text-[10.5px]">{d.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {folderDocs.length === 0 && (
                        <div className="p-3 text-center text-zinc-600 italic text-[9px] select-none">Empty Folder</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // BOXES VIEW MODE
            boxes.map(bName => {
              const boxDocs = filteredDocs.filter(d => d.box === bName);
              const isCollapsed = collapsedBoxes[bName];

              return (
                <div key={bName} className="space-y-1.5">
                  <button
                    onClick={() => toggleBoxCollapse(bName)}
                    className="w-full flex items-center justify-between text-[#8a8a93] hover:text-white transition-colors py-1 group"
                  >
                    <div className="flex items-center space-x-1.5 font-bold tracking-wide text-[10.5px]">
                      <Package className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                      <span className="truncate">{bName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[8px] bg-white/5 text-white/40 group-hover:bg-white/10 px-1 rounded-sm">{boxDocs.length}</span>
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="pl-3 border-l border-white/5 space-y-2 mt-1 animate-fade-in">
                      {collections.map(cName => {
                        const collDocs = boxDocs.filter(d => d.collection === cName);
                        if (collDocs.length === 0) return null;

                        return (
                          <div key={cName} className="space-y-0.5 mt-1.5">
                            <span className="text-[8px] font-mono tracking-widest text-[#daff33]/80 hover:text-[#daff33] uppercase font-black block pl-1 flex items-center mb-0.5 select-none">
                              <Grid className="w-2.5 h-2.5 opacity-55 mr-1 text-[#daff33]" />
                              {cName}
                            </span>
                            
                            {collDocs.map(d => (
                              <button
                                key={d.id}
                                onClick={() => {
                                  onSetActiveDocId(d.id);
                                  setIsEditing(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-1.5 transition-all cursor-pointer ${
                                  activeDocId === d.id 
                                    ? 'bg-amber-550/15 text-white font-bold border-l-2 border-amber-400' 
                                    : 'hover:bg-white/[0.02] text-white/50 border-l border-transparent'
                                }`}
                              >
                                <FileText className="w-3 h-3 text-white/20 shrink-0" />
                                <span className="truncate text-[10.5px]">{d.title}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })}

                      {/* Display un-collectioned docs in boxes */}
                      {boxDocs.filter(d => !d.collection).length > 0 && (
                        <div className="space-y-0.5 pt-1">
                          {boxDocs.filter(d => !d.collection).map(d => (
                            <button
                              key={d.id}
                              onClick={() => {
                                  onSetActiveDocId(d.id);
                                  setIsEditing(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-1.5 transition-all cursor-pointer ${
                                activeDocId === d.id 
                                  ? 'bg-amber-550/15 text-white font-bold border-l-2 border-amber-400' 
                                  : 'hover:bg-white/[0.02] text-white/50 border-l border-transparent'
                              }`}
                            >
                              <FileText className="w-3 h-3 text-white/20 shrink-0" />
                              <span className="truncate text-[10.5px]">{d.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {boxDocs.length === 0 && (
                        <div className="p-3 text-center text-zinc-600 italic text-[9px] select-none">Empty Box</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Unassigned Document Fallback Section */}
          {(explorerViewMode === 'folders' 
             ? filteredDocs.filter(d => !d.folder) 
             : filteredDocs.filter(d => !d.box)
          ).length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Unassigned Items</span>
              <div className="space-y-0.5">
                {(explorerViewMode === 'folders' 
                   ? filteredDocs.filter(d => !d.folder) 
                   : filteredDocs.filter(d => !d.box)
                ).map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSetActiveDocId(d.id);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-1.5 transition-all cursor-pointer ${
                      activeDocId === d.id 
                        ? 'bg-white/5 text-white font-bold border-l-2 border-white/30' 
                        : 'hover:bg-white/[0.02] text-white/50 border-l border-transparent'
                    }`}
                  >
                    <FileText className="w-3 h-3 text-white/20 shrink-0" />
                    <span className="truncate text-[10.5px]">{d.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length === 0 && (
            <div className="p-4 text-center text-white/20 italic text-[10px] select-none">No matches found</div>
          )}
        </div>

        {/* Create Document button */}
        <button
          onClick={onCreateDoc}
          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] rounded-lg text-white font-bold flex items-center justify-center space-x-1.5 transition-colors shrink-0 cursor-pointer select-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Document</span>
        </button>
      </aside>

      {/* 2. Main content and Editor Panel */}
      <div className="flex-grow flex flex-col bg-[#0d0d10] p-6 overflow-y-auto relative">
        {currentDoc ? (
          <div className="space-y-4 max-w-3xl select-text">
            
            {/* Multi-tier Categorization Metadata Picker (Folder, Section, Box, Collection, Category) */}
            <div className="bg-[#0c0c0f] p-4 border border-white/5 rounded-2xl space-y-3 shadow-inner selection:bg-indigo-650">
              <p className="text-[10px] font-mono font-bold tracking-widest text-[#a1a1aa] uppercase mb-1 flex items-center space-x-1.5">
                <span>📚 Hierarchy & Storage Allocations</span>
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[8px] font-mono font-bold uppercase text-zinc-500 block mb-1">📁 FOLDER</label>
                  <select
                    value={currentDoc.folder || ''}
                    onChange={(e) => handleFolderChange(e.target.value)}
                    className="w-full text-[10.5px] py-1 px-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                  >
                    <option value="" className="bg-[#0C0C0C]">Unassigned Folder</option>
                    {folders.map(f => (
                      <option key={f} value={f} className="bg-[#0C0C0C]">📁 {f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-mono font-bold uppercase text-zinc-500 block mb-1">⚡ SECTION</label>
                  <select
                    value={currentDoc.section || ''}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="w-full text-[10.5px] py-1 px-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="" className="bg-[#0C0C0C]">Unassigned Section</option>
                    {sections.map(s => (
                      <option key={s} value={s} className="bg-[#0C0C0C]">⚡ {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-mono font-bold uppercase text-zinc-500 block mb-1">📦 BOX</label>
                  <select
                    value={currentDoc.box || ''}
                    onChange={(e) => handleBoxChange(e.target.value)}
                    className="w-full text-[10.5px] py-1 px-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="" className="bg-[#0C0C0C]">Not Assigned to Box</option>
                    {boxes.map(b => (
                      <option key={b} value={b} className="bg-[#0C0C0C]">📦 {b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-mono font-bold uppercase text-zinc-500 block mb-1">🧩 COLLECTION</label>
                  <select
                    value={currentDoc.collection || ''}
                    onChange={(e) => handleCollectionChange(e.target.value)}
                    className="w-full text-[10.5px] py-1 px-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="" className="bg-[#0C0C0C]">Not in Collection</option>
                    {collections.map(c => (
                      <option key={c} value={c} className="bg-[#0C0C0C]">🧩 {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-[8px] font-mono font-bold uppercase text-zinc-500">CATEGORY:</span>
                  <select
                    value={currentDoc.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="text-[10px] py-0.5 px-2 rounded bg-white/5 border border-white/10 text-zinc-300 cursor-pointer focus:outline-none"
                  >
                    {['Specification', 'Overview', 'Guide', 'API Schema', 'Meeting Minutes'].map(c => (
                      <option key={c} value={c} className="bg-[#0C0C0C]">{c}</option>
                    ))}
                  </select>
                </div>

                <div className="text-[10px] text-white/30 truncate">
                  Registered: {currentDoc.updatedAt}
                </div>
              </div>
            </div>

            {/* Top Preview/Edit Selector Toolbar */}
            <div className="flex justify-between items-center bg-[#070708] p-3 rounded-xl border border-white/5 gap-4 select-none">
              <div className="flex items-center space-x-3 text-[10px] min-w-0">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase font-mono font-bold shrink-0">
                  {currentDoc.category}
                </span>
                {currentDoc.box && (
                  <span className="px-2 py-0.5 rounded bg-amber-600/10 text-amber-400 text-[9px] font-bold font-mono">
                    BOX: {currentDoc.box}
                  </span>
                )}
                {currentDoc.collection && (
                  <span className="px-2 py-0.5 rounded bg-zinc-550 text-white text-[9px] font-bold font-mono">
                    {currentDoc.collection}
                  </span>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setIsEditing(prev => !prev)}
                className="h-8 px-4 border border-white/15 hover:bg-white/5 rounded-xl text-[10px] font-bold text-white transition-all shrink-0 cursor-pointer"
              >
                {isEditing ? 'Preview Markdown' : 'Edit Source text'}
              </button>
            </div>

            {/* Document Forms Inputs */}
            <div className="space-y-3.5">
              <input
                type="text"
                value={currentDoc.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Specification Title..."
                className="w-full text-lg md:text-xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 text-white tracking-tight"
              />

              {isEditing ? (
                <textarea
                  value={currentDoc.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-[410px] p-4 text-xs rounded-xl border border-white/10 bg-black/30 font-mono outline-none focus:border-indigo-500 text-white/90 leading-relaxed custom-textarea shadow-inner"
                />
              ) : (
                <article className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-4 pt-2 text-xs">
                  {currentDoc.content.split('\n').map((line, ix) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('# ')) {
                      return (
                        <h1 key={ix} className="text-base font-bold text-white border-b border-white/5 pb-1.5 pt-3 tracking-tight">
                          {trimmedLine.replace(/^#\s+/, '')}
                        </h1>
                      );
                    } else if (trimmedLine.startsWith('### ')) {
                      return (
                        <h3 key={ix} className="text-xs font-bold text-indigo-400 uppercase tracking-widest pt-3 leading-none">
                          {trimmedLine.replace(/^###\s+/, '')}
                        </h3>
                      );
                    } else if (trimmedLine.startsWith('- ')) {
                      return (
                        <li key={ix} className="list-disc pl-4 text-[11.5px] leading-relaxed text-white/80">
                          {trimmedLine.replace(/^-\s+/, '')}
                        </li>
                      );
                    } else {
                      return <p key={ix} className="text-[11.5px] leading-relaxed text-white/70">{line || '\u00A0'}</p>;
                    }
                  })}
                </article>
              )}
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/20 text-center select-none">
            <BookOpen className="w-10 h-10 text-white/10 mb-3" />
            <p>Select or create a document to synchronize engineering plans.</p>
          </div>
        )}
      </div>

    </div>
  );
}

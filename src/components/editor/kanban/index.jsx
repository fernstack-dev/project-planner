"use client";

import { useState, useEffect, useCallback } from "react";
import { KanbanBoard } from "./kanban-board";
import { BoardTabs } from "./board-tabs";

export function ProjectKanban({ projectId }) {
  const [boards, setBoards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [activeBoardId, setActiveBoardId] = useState(null);

  const availableColors = [
    "#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#6366f1"
  ];

  // Fetch board data
  useEffect(() => {
  const fetchBoards = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/boards`);
      if (!res.ok) {
        throw new Error(`Failed to fetch boards: ${res.status}`);
      }
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      if (data.length === 0) {
        const createRes = await fetch(`/api/projects/${projectId}/boards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Канбан-доска' }),
        });
        if (!createRes.ok) {
          throw new Error(`Failed to create default board: ${createRes.status}`);
        }
        const newBoard = await createRes.json();
        data = [newBoard];
      }
      setBoards(data);
      if (data[0]?.id) {
        setActiveBoardId(data[0].id);
      } else {
        setActiveBoardId(null);
      }
    } catch (err) {
      console.error(err);
      setBoards([]);
      setActiveBoardId(null);
    } finally {
      setLoading(false);
    }
  };
  fetchBoards();
}, [projectId]);

  useEffect(() => {
  if (!activeBoardId) return;
  let isMounted = true;
  const fetchBoard = async () => {
    try {
      const res = await fetch(`/api/boards/${activeBoardId}`);
      if (res.status === 404) {
        // Active board no longer exists – refresh boards list
        const boardsRes = await fetch(`/api/projects/${projectId}/boards`);
        const freshBoards = await boardsRes.json();
        if (isMounted && freshBoards.length > 0) {
          setBoards(freshBoards);
          setActiveBoardId(freshBoards[0].id);
        } else if (isMounted) {
          setBoards([]);
          setActiveBoardId(null);
          setColumns([]);
        }
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.columns) {
        console.error('Invalid board data:', data);
        return;
      }
      const colsWithCollapsed = data.columns.map(col => ({ ...col, title: col.name, collapsed: false }));
      if (isMounted) setColumns(colsWithCollapsed);
    } catch (err) {
      console.error('Failed to fetch board:', err);
    }
  };
  fetchBoard();
  return () => { isMounted = false; };
}, [activeBoardId, projectId]);


  // useEffect(() => {
  //   const fetchBoard = async () => {
  //     try {
  //       const url = `/api/projects/${projectId}/board`;
  //       const res = await fetch(url);
  //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //       const data = await res.json();
  //       console.log('Board data:', data);
  //       if (data.board && data.columns) {
  //         setBoard(data.board);
  //         const colsWithCollapsed = data.columns.map(col => ({ 
  //           ...col, 
  //           title: col.name,  // map name → title
  //           collapsed: false 
  //         }));
  //         setColumns(colsWithCollapsed);
  //       } else {
  //         console.error('Invalid response structure', data);
  //       }
  //     } catch (err) {
  //       console.error('Fetch error:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchBoard();
  // }, [projectId]);

  const handleAddBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `Новая доска ${(boards?.length ?? 0) + 1}` }),
      });
      const newBoard = await res.json();
      setBoards(prev => [...prev, newBoard]);
      setActiveBoardId(newBoard.id);
    } catch (err) {
      console.error(err);
    }
  }, [projectId, boards]);


  const handleRenameBoard = useCallback(async (boardId, newName) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const updated = await res.json();
      setBoards(prev => prev.map(b => b.id === boardId ? updated : b));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleDeleteBoard = useCallback(async (boardId) => {
    if (boards.length === 1) return;
    try {
      const res = await fetch(`/api/boards/${boardId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        console.error('Delete failed:', data.error);
        return;
      }
      // Refresh boards list
      const boardsRes = await fetch(`/api/projects/${projectId}/boards`);
      const freshBoards = await boardsRes.json();
      setBoards(freshBoards);
      if (freshBoards.length > 0) {
        setActiveBoardId(freshBoards[0].id);
      } else {
        setActiveBoardId(null);
      }
    } catch (err) {
      console.error(err);
      // Still try to refresh
      const boardsRes = await fetch(`/api/projects/${projectId}/boards`);
      const freshBoards = await boardsRes.json();
      setBoards(freshBoards);
    }
  }, [boards, activeBoardId, projectId]);

  const handleReorderBoards = useCallback(async (newBoards) => {
    setBoards(newBoards);
    try {
      await fetch(`/api/projects/${projectId}/boards/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardIds: newBoards.map(b => b.id) }),
      });
    } catch (err) {
      console.error(err);
    }
  }, [projectId]);

  // Update columns (local state) and optionally persist reordering
  const updateActiveBoardColumns = useCallback((updaterOrArray) => {
    setColumns(prev => {
      const newColumns = typeof updaterOrArray === 'function' ? updaterOrArray(prev) : updaterOrArray;
      // If order changed, persist column reorder
      if (JSON.stringify(prev.map(c => c.id)) !== JSON.stringify(newColumns.map(c => c.id))) {
        fetch(`/api/boards/${activeBoardId}/columns/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedColumnIds: newColumns.map(c => c.id) }),
        }).catch(console.error);
      }
      return newColumns;
    });
  }, [activeBoardId]);

  // Column operations
  const handleAddColumn = useCallback(async () => {
    if (!activeBoardId) return;
    try {
      const res = await fetch(`/api/boards/${activeBoardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Новая колонка', color: availableColors[Math.floor(Math.random() * availableColors.length)] }),
      });
      const newColumn = await res.json();
      // Map `name` to `title` and add collapsed property
      const columnWithTitle = { ...newColumn, title: newColumn.name, cards: [], collapsed: false };
      setColumns(prev => [...prev, columnWithTitle]);
    } catch (err) {
      console.error(err);
    }
  }, [activeBoardId, availableColors]);

  const handleRemoveColumn = useCallback(async (columnId) => {
    try {
      const res = await fetch(`/api/columns/${columnId}`, { method: 'DELETE' });
      console.log('Delete response status:', res.status);
      if (!res.ok) {
        const error = await res.text();
        console.error('Delete failed:', error);
        return;
      }
      const data = await res.json();
      console.log('Delete response data:', data);
      if (data.success) {
        setColumns(prev => prev.filter(col => col.id !== columnId));
      } else {
        console.error('Delete not successful:', data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);


  const updateColumnTitle = useCallback(async (columnId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTitle }),
      });
      const updated = await res.json();
      // Update both `name` (for database) and `title` (for UI)
      setColumns(prev => prev.map(col =>
        col.id === columnId ? { ...col, ...updated, title: updated.name } : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateColumnColor = useCallback(async (columnId, newColor) => {
    try {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: newColor }),
      });
      const updated = await res.json();
      setColumns(prev => prev.map(col => col.id === columnId ? { ...col, ...updated } : col));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const toggleColumnCollapse = useCallback((columnId) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, collapsed: !col.collapsed } : col
    ));
  }, []);

  // Card operations
  const handleAddCard = useCallback(async (columnId) => {
    try {
      const res = await fetch(`/api/columns/${columnId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Новая задача', priority: 'none' }),
      });
      const newCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
      ));
      setEditingCardId(newCard.id);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleRemoveCard = useCallback(async (columnId, cardId) => {
    try {
      await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
      setColumns(prev => prev.map(col =>
        col.id === columnId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateCardContent = useCallback(async (columnId, cardId, newContent) => {
    if (!newContent.trim()) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateCardPriority = useCallback(async (columnId, cardId, priority) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateCardDueDate = useCallback(async (columnId, cardId, dueDate) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateCardDescription = useCallback(async (columnId, cardId, description) => {
    // Optimistic update
    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, cards: col.cards.map(c => c.id === cardId ? { ...c, description } : c) }
        : col
    ));
    // Background update
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(`HTTP ${res.status}: ${error}`);
      }
      const updatedCard = await res.json();
      console.log('Description saved:', updatedCard);
    } catch (err) {
      console.error('Failed to update description:', err);
      // Optionally revert the optimistic update
    }
  }, []);

  const addCardLabel = useCallback(async (columnId, cardId, label) => {
    try {
      const card = columns.find(col => col.id === columnId)?.cards.find(c => c.id === cardId);
      if (!card) return;
      const newLabels = [...(card.labels || []), label];
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: newLabels }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, [columns]);

  const removeCardLabel = useCallback(async (columnId, cardId, labelId) => {
    try {
      const card = columns.find(col => col.id === columnId)?.cards.find(c => c.id === cardId);
      if (!card) return;
      const newLabels = card.labels?.filter(l => l.id !== labelId) || [];
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: newLabels }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, [columns]);

  const updateCardAssignee = useCallback(async (columnId, cardId, assignee) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const addCardChecklistItem = useCallback(async (columnId, cardId, item) => {
    try {
      const card = columns.find(col => col.id === columnId)?.cards.find(c => c.id === cardId);
      if (!card) return;
      const newChecklist = [...(card.checklist || []), item];
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: newChecklist }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, [columns]);

  const toggleChecklistItem = useCallback(async (columnId, cardId, itemId) => {
    try {
      const card = columns.find(col => col.id === columnId)?.cards.find(c => c.id === cardId);
      if (!card) return;
      const newChecklist = card.checklist?.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ) || [];
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: newChecklist }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, [columns]);

  const removeChecklistItem = useCallback(async (columnId, cardId, itemId) => {
    try {
      const card = columns.find(col => col.id === columnId)?.cards.find(c => c.id === cardId);
      if (!card) return;
      const newChecklist = card.checklist?.filter(item => item.id !== itemId) || [];
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: newChecklist }),
      });
      const updatedCard = await res.json();
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(c => c.id === cardId ? updatedCard : c) }
          : col
      ));
    } catch (err) {
      console.error(err);
    }
  }, [columns]);

  if (loading) return <div className="text-gray-400 text-center py-8">Загрузка доски...</div>;

  return (
    <div className="space-y-4">
      <BoardTabs
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        onAddBoard={handleAddBoard}
        onRenameBoard={handleRenameBoard}
        onDeleteBoard={handleDeleteBoard}
        onReorderBoards={handleReorderBoards}
      />
      <KanbanBoard
        columns={columns}
        setColumns={updateActiveBoardColumns}
        onAddColumn={handleAddColumn}
        onRemoveColumn={handleRemoveColumn}
        onToggleCollapse={toggleColumnCollapse}
        onUpdateColumnTitle={updateColumnTitle}
        onUpdateColumnColor={updateColumnColor}
        onAddCard={handleAddCard}
        onRemoveCard={handleRemoveCard}
        onUpdateCardContent={updateCardContent}
        onUpdateCardPriority={updateCardPriority}
        onUpdateCardDueDate={updateCardDueDate}
        onUpdateCardDescription={updateCardDescription}
        onAddCardLabel={addCardLabel}
        onRemoveCardLabel={removeCardLabel}
        onUpdateCardAssignee={updateCardAssignee}
        onAddCardChecklistItem={addCardChecklistItem}
        onToggleChecklistItem={toggleChecklistItem}
        onRemoveChecklistItem={removeChecklistItem}
        editingColumnId={editingColumnId}
        setEditingColumnId={setEditingColumnId}
        editingCardId={editingCardId}
        setEditingCardId={setEditingCardId}
        availableColors={availableColors}
      />
    </div>
  );
}
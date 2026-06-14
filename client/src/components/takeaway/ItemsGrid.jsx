import React from 'react';
import ItemCard from './ItemCard';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import SortableItem from './SortableItem'; // We will create this wrapper next

const ItemsGrid = ({ items, setItems, loading, onAddItem }) => {
  // Set up sensors for drag detection (Pointer for mouse/touch, Keyboard for accessibility)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires moving 8px before dragging starts (prevents accidental drags on clicks)
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle what happens when an item is dropped

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const updatedItems = arrayMove(items, oldIndex, newIndex);
      setItems(updatedItems);

      // Save just the array of IDs in their custom sequence to localStorage
      const orderedIds = updatedItems.map(item => item.id);
      localStorage.setItem('takeaway_items_order', JSON.stringify(orderedIds));
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-36 bg-slate-200 w-full" />
            <div className="p-5 flex flex-col gap-3">
              <div className="h-4 w-16 bg-slate-200 rounded-md" />
              <div className="h-6 w-32 bg-slate-200 rounded-md" />
              <div className="flex justify-between items-center mt-1">
                <div className="h-6 w-20 bg-slate-200 rounded-md" />
                <div className="h-9 w-9 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 select-none">
        <svg className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span className="text-lg font-semibold">No items found</span>
        <span className="text-sm mt-1">Try adding menu items in Items Management</span>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      {/* rectSortingStrategy is crucial for multi-column/row grid layouts */}
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start pb-6">
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              <ItemCard item={item} onAdd={onAddItem} />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ItemsGrid;
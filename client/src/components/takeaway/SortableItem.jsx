import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Lower opacity of the element currently being dragged so the user sees where it came from
    opacity: isDragging ? 0.4 : 1, 
    cursor: 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`transition-shadow ${isDragging ? 'z-50 cursor-grabbing shadow-xl rounded-2xl' : ''}`}
    >
      {children}
    </div>
  );
};

export default SortableItem;
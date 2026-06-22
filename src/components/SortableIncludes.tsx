"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus } from "lucide-react";

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
}

function SortableItem({ id, index, value, onUpdate, onRemove }: {
  id: string;
  index: number;
  value: string;
  onUpdate: (val: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: "flex",
    gap: 8,
    alignItems: "center",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        style={{
          width: 28, height: 44, borderRadius: 6,
          border: "1px solid #f0d0de", backgroundColor: "#FFF5F7",
          cursor: isDragging ? "grabbing" : "grab",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#C5668E", flexShrink: 0, touchAction: "none",
        }}
      >
        <GripVertical size={16} />
      </button>

      <input
        value={value}
        onChange={e => onUpdate(e.target.value)}
        placeholder={`Item ${index + 1}`}
        style={{
          flex: 1, padding: "10px 12px", borderRadius: 8,
          border: "1px solid #f0d0de", fontSize: 13,
          fontFamily: "inherit", backgroundColor: "#FFF5F7",
          color: "#3d1f2e", boxSizing: "border-box",
        }}
      />

      <button
        type="button"
        onClick={onRemove}
        style={{
          width: 36, height: 44, borderRadius: 8,
          border: "1px solid #ffc9c9", backgroundColor: "#fff0f0",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#c92a2a", flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function SortableIncludes({ items, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Use index-based IDs since values may be duplicates
  const ids = items.map((_, i) => `item-${i}`);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    onChange(arrayMove(items, oldIndex, newIndex));
  }

  function update(index: number, val: string) {
    const next = [...items];
    next[index] = val;
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, ""]);
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item, i) => (
              <SortableItem
                key={ids[i]}
                id={ids[i]}
                index={i}
                value={item}
                onUpdate={val => update(i, val)}
                onRemove={() => remove(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={add}
        style={{
          marginTop: 8, padding: "8px 14px", borderRadius: 8,
          border: "1px dashed #C5668E", backgroundColor: "#FFF5F7",
          color: "#8B2252", fontSize: 13, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <Plus size={14} /> Adicionar item
      </button>
    </div>
  );
}

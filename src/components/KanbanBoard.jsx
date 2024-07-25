import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = {
  CARD: 'card',
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [
      { id: 1, text: 'Task 1' },
      { id: 2, text: 'Task 2' },
    ],
    inProgress: [
      { id: 3, text: 'Task 3' },
    ],
    done: [
      { id: 4, text: 'Task 4' },
    ],
  });

  const moveCard = (cardId, sourceColumn, targetColumn) => {
    const sourceCards = tasks[sourceColumn];
    const targetCards = tasks[targetColumn];

    const card = sourceCards.find((c) => c.id === cardId);
    const newSourceCards = sourceCards.filter((c) => c.id !== cardId);
    const newTargetCards = [...targetCards, card];

    setTasks({
      ...tasks,
      [sourceColumn]: newSourceCards,
      [targetColumn]: newTargetCards,
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex space-x-4">
        {['todo', 'inProgress', 'done'].map((column) => (
          <Column
            key={column}
            title={column}
            tasks={tasks[column]}
            moveCard={moveCard}
          />
        ))}
      </div>
    </DndProvider>
  );
};

const Column = ({ title, tasks, moveCard }) => {
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    drop: (item) => moveCard(item.id, item.sourceColumn, title),
  });

  return (
    <div ref={drop} className="w-1/3 bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      {tasks.map((task) => (
        <Card key={task.id} id={task.id} text={task.text} sourceColumn={title} />
      ))}
    </div>
  );
};

const Card = ({ id, text, sourceColumn }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.CARD,
    item: { id, sourceColumn },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`p-4 mb-4 bg-white rounded-lg shadow-md cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {text}
    </div>
  );
};

export default KanbanBoard;

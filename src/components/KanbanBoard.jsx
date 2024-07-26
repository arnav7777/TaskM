import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import TaskModal from './TaskModal';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ItemType = {
  CARD: 'card',
};

const truncateText = (text, length) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${backendUrl}/tasks`);
        const tasksData = response.data;

        setTasks({
          todo: tasksData.filter(task => task.status === 'todo'),
          inProgress: tasksData.filter(task => task.status === 'inProgress'),
          done: tasksData.filter(task => task.status === 'done'),
        });
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const openModal = (task = null, mode = 'edit') => {
    if (mode === 'edit') {
      setEditingTask(task);
      setViewingTask(null);
    } else if (mode === 'view') {
      setViewingTask(task);
      setEditingTask(null);
    } else {
      setEditingTask(null);
      setViewingTask(null);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setViewingTask(null);
    setModalIsOpen(false);
  };

  const addTask = async (text, description) => {
    const newTask = {
      taskname: text,
      description,
      createdAt: new Date().toISOString(),
      status: 'todo',
    };
    try {
      const response = await axios.post(`${backendUrl}/tasks`, newTask);
      const createdTask = response.data;

      setTasks((prevTasks) => ({
        ...prevTasks,
        todo: [...prevTasks.todo, createdTask],
      }));
      closeModal();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const editTask = async (id, taskname, description) => {
    const updatedTask = {
      taskname,
      description,
    };
    try {
      const response = await axios.put(`${backendUrl}/tasks/${id}`, updatedTask);
      const editedTask = response.data;

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        ['todo', 'inProgress', 'done'].forEach((column) => {
          newTasks[column] = newTasks[column].map((task) =>
            task.id === id ? editedTask : task
          );
        });
        return newTasks;
      });
      closeModal();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${backendUrl}/tasks/${id}`);

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        ['todo', 'inProgress', 'done'].forEach((column) => {
          newTasks[column] = newTasks[column].filter((task) => task.id !== id);
        });
        return newTasks;
      });
      closeModal();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const moveCard = async (cardId, sourceColumn, targetColumn) => {
    if (sourceColumn === targetColumn) return;

    const sourceCards = tasks[sourceColumn];
    const targetCards = tasks[targetColumn];

    const card = sourceCards.find((c) => c.id === cardId);
    if (!card) return;

    const updatedCard = { ...card, status: targetColumn };
    console.log(updatedCard);

    try {
      await axios.put(`${backendUrl}/tasks/${cardId}`, updatedCard);

      const newSourceCards = sourceCards.filter((c) => c.id !== cardId);
      const newTargetCards = [...targetCards, updatedCard];

      setTasks({
        ...tasks,
        [sourceColumn]: newSourceCards,
        [targetColumn]: newTargetCards,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const filterAndSortTasks = (tasks) => {
    let filteredTasks = tasks.filter((task) =>
      task.taskname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'oldest') {
      filteredTasks = filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      filteredTasks = filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filteredTasks;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex flex-col md:flex-row md:space-x-4 w-full md:w-auto mb-4 md:mb-0">
            <button
              onClick={() => openModal(null, 'edit')}
              className="bg-gray-900 text-white rounded p-2 hover:bg-gray-700 text-xs mb-2 md:mb-0 w-full md:w-auto"
            >
              Add Task
            </button>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded p-2 flex-grow text-xs md:mb-0 w-full md:w-1/3"
            />
          </div>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="border border-gray-300 rounded p-2 text-xs w-full md:w-auto"
          >
            <option value="recent">Sort By: Recent</option>
            <option value="oldest">Sort By: Oldest</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
          {['todo', 'inProgress', 'done'].map((column) => (
            <Column
              key={column}
              title={column}
              tasks={filterAndSortTasks(tasks[column])}
              moveCard={moveCard}
              openModal={openModal}
              deleteTask={deleteTask}
            />
          ))}
        </div>

        <TaskModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          addTask={addTask}
          editTask={editTask}
          deleteTask={deleteTask}
          taskToEdit={editingTask || viewingTask}
          viewTask={!!viewingTask}
        />
      </div>
    </DndProvider>
  );
};

// Column Component
const Column = ({ title, tasks, moveCard, openModal, deleteTask }) => {
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    drop: (item) => moveCard(item.id, item.sourceColumn, title),
  });

  return (
    <div ref={drop} className="w-full md:w-1/3 bg-gray-200 p-4 rounded-lg shadow-md">
      <h2 className="font-bold text-md mb-4 uppercase text-gray-700">{title}</h2>
      {tasks.map((task) => (
        <Card
          key={task.id}
          id={task.id}
          task={task}
          sourceColumn={title}
          openModal={openModal}
          deleteTask={deleteTask}
        />
      ))}
    </div>
  );
};

// Card Component
const Card = ({ id, task, sourceColumn, openModal, deleteTask }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.CARD,
    item: { id, sourceColumn },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleEdit = () => {
    openModal(task, 'edit');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
    }
  };

  const handleViewDetails = () => {
    openModal(task, 'view');
  };

  return (
    <div
      ref={drag}
      className={`p-4 mb-4 bg-white rounded-lg shadow-md cursor-move border ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <h3 className="font-bold text-lg mb-2 text-gray-900">{task.taskname}</h3>
      <p className="text-sm mb-2 text-gray-600">{truncateText(task.description, 15)}</p>
      <p className="text-xs mb-2 text-gray-400">Created at: {task.createdAt}</p>
      <div className="flex">
        <button
          onClick={handleDelete}
          className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
        >
          Delete
        </button>
        <button
          onClick={handleEdit}
          className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
        >
          Edit
        </button>
        <button
          onClick={handleViewDetails}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default KanbanBoard;

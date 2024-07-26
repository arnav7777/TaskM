import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const TaskModal = ({ isOpen, onRequestClose, addTask, editTask, viewTask, taskToEdit }) => {
  const [taskname, setTaskname] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [isViewing, setIsViewing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTaskname(taskToEdit.taskname);
      setDescription(taskToEdit.description);
      setCreatedAt(taskToEdit.createdAt);
      setIsViewing(!!viewTask);
    } else {
      // Clear fields if taskToEdit is not available (for new task)
      setTaskname('');
      setDescription('');
      setCreatedAt('');
      setIsViewing(false);
    }
  }, [taskToEdit, viewTask, isOpen]); // Add isOpen to dependency array

  const handleSave = () => {
    if (!taskname || !description) {
      setError('All fields are required.');
      return;
    }

    setError(''); // Clear error if fields are valid

    if (taskToEdit) {
      // Call editTask function if taskToEdit is present
      editTask(taskToEdit.id, taskname, description);
    } else {
      // Call addTask function if taskToEdit is not present
      addTask(taskname, description);
    }
    onRequestClose(); // Close the modal after saving
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-lg font-bold mb-4">
            {isViewing ? 'Task Details' : taskToEdit ? 'Edit Task' : 'Add Task'}
          </h2>
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          <input
            type="text"
            placeholder="Task Name"
            value={taskname}
            onChange={(e) => !isViewing && setTaskname(e.target.value)}
            disabled={isViewing}
            className={`border border-gray-300 rounded p-2 w-full mb-2 ${isViewing ? 'bg-gray-100' : ''}`}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => !isViewing && setDescription(e.target.value)}
            disabled={isViewing}
            className={`border border-gray-300 rounded p-2 w-full mb-2 ${isViewing ? 'bg-gray-100' : ''}`}
          />
          {isViewing && taskToEdit && (
            <p className="text-sm text-gray-500 mb-2">Created at: {createdAt}</p>
          )}
          <div className="flex justify-end">
            {!isViewing ? (
              <>
                <button
                  onClick={handleSave}
                  className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
        >
                  {taskToEdit ? 'Save Changes' : 'Add Task'}
                </button>
                <button
                  onClick={onRequestClose}
                  className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
        >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={onRequestClose}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
       >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  addTask: PropTypes.func,
  editTask: PropTypes.func,
  viewTask: PropTypes.bool,
  taskToEdit: PropTypes.shape({
    id: PropTypes.number,
    taskname: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};

export default TaskModal;

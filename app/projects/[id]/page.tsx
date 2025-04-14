'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ReactSortable } from 'react-sortablejs';

interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  status: 'todo' | 'in-progress' | 'done';
  due_date: string;
  priority: 'low' | 'medium' | 'high';
}

interface Project {
  id: number;
  name: string;
  description: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDueDate, setFilterDueDate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const projRes = await fetch(`/api/projects/${projectId}`, {
        credentials: 'include',
      });
      if (projRes.ok) {
        setProject(await projRes.json());
      } else if (projRes.status === 404) {
        router.push('/projects');
      }

      const taskRes = await fetch(`/api/tasks?projectId=${projectId}`, {
        credentials: 'include',
      });
      if (taskRes.ok) {
        setTasks(await taskRes.json());
      }
    };
    fetchData();
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setError(null);

    const body = {
      title,
      description,
      status,
      priority,
      due_date: dueDate || null,
      projectId,
    };
    const url = editingTaskId ? `/api/tasks/${editingTaskId}` : '/api/tasks';
    const method = editingTaskId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError('Failed to save task');
      return;
    }
    const saved = await res.json();
    setTasks((prev) =>
      editingTaskId
        ? prev.map((t) => (t.id === editingTaskId ? saved : t))
        : [...prev, saved]
    );

    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDueDate('');
    setEditingTaskId(null);
  };

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.due_date.split('T')[0] || '');
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority)
      return false;
    if (filterDueDate && task.due_date !== filterDueDate) return false;
    return true;
  });

  const noFiltersActive =
    filterStatus === 'all' && filterPriority === 'all' && !filterDueDate;

  return (
    <div className='min-h-screen bg-gray-50 transition-all duration-200 ease-in-out'>
      {/* Header */}
      <header className='bg-white shadow py-4 px-6 flex items-center justify-between'>
        <button
          onClick={() => router.push('/projects')}
          className='text-blue-600 cursor-pointer transition-all duration-200 ease-in-out text-sm'
        >
          &larr; Back to Projects
        </button>
        <h1 className='text-3xl font-bold text-gray-800'>Project Details</h1>
      </header>

      <main className='max-w-3xl mx-auto p-6'>
        {/* Project Info */}
        {project ? (
          <div className='mb-8'>
            <h2 className='text-2xl font-semibold text-gray-800'>
              {project.name}
            </h2>
            {project.description && (
              <p className='mt-2 text-gray-600'>{project.description}</p>
            )}
          </div>
        ) : (
          <div className='mb-8 text-center text-gray-600'>
            Loading project...
          </div>
        )}

        {/* Filters */}
        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2 text-gray-800'>
            Filter Tasks
          </h3>
          <div className='flex flex-wrap items-center space-x-4'>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Statuses</option>
              <option value='todo'>Todo</option>
              <option value='in-progress'>In Progress</option>
              <option value='done'>Done</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className='border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Priorities</option>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
            <input
              type='date'
              value={filterDueDate}
              onChange={(e) => setFilterDueDate(e.target.value)}
              className='border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500'
            />
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterDueDate('');
              }}
              className='text-blue-600 cursor-pointer transition-all duration-200 ease-in-out text-sm'
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* Task List */}
        <section className='mb-8'>
          <h3 className='text-xl font-semibold mb-4 text-gray-800'>Tasks</h3>

          {filteredTasks.length === 0 ? (
            <p className='text-gray-600'>
              No tasks match the selected filters.
            </p>
          ) : noFiltersActive ? (
            <ReactSortable
              list={tasks}
              setList={setTasks}
              tag='ul'
              className='space-y-4'
              animation={150}
              ghostClass='opacity-50'
              handle='.handle'
            >
              {tasks.map((task) => (
                <li
                  key={task.id}
                  data-id={task.id.toString()}
                  className='bg-white p-4 rounded shadow flex justify-between items-start transition-all duration-200 ease-in-out cursor-grab'
                >
                  <div className='flex items-center space-x-2'>
                    <span className='handle cursor-grab'>⋮⋮</span>
                    <div>
                      <p className='text-lg font-medium text-gray-800'>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className='text-gray-600 mt-1'>{task.description}</p>
                      )}
                      <div className='mt-2 text-sm text-gray-500 space-x-2'>
                        <span>Status: {task.status}</span>
                        <span>Priority: {task.priority}</span>
                        <span>
                          Due:{' '}
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString()
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col items-end space-y-2'>
                    <button
                      onClick={() => startEditTask(task)}
                      className='text-sm text-blue-600 cursor-pointer transition-all duration-200 ease-in-out'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className='text-sm text-red-600 cursor-pointer transition-all duration-200 ease-in-out'
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ReactSortable>
          ) : (
            <ul className='space-y-4'>
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className='bg-white p-4 rounded shadow flex justify-between items-start transition-all duration-200 ease-in-out'
                >
                  <div>
                    <p className='text-lg font-medium text-gray-800'>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className='text-gray-600 mt-1'>{task.description}</p>
                    )}
                    <div className='mt-2 text-sm text-gray-500 space-x-2'>
                      <span>Status: {task.status}</span>
                      <span>Priority: {task.priority}</span>
                      <span>
                        Due:{' '}
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <div className='flex flex-col items-end space-y-2'>
                    <button
                      onClick={() => startEditTask(task)}
                      className='text-sm text-blue-600 cursor-pointer transition-all duration-200 ease-in-out'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className='text-sm text-red-600 cursor-pointer transition-all duration-200 ease-in-out'
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add/Edit Task Form */}
        <section className='bg-white p-6 rounded shadow transition-all duration-200 ease-in-out'>
          <h3 className='text-2xl font-semibold mb-4 text-gray-800'>
            {editingTaskId ? 'Edit Task' : 'Add New Task'}
          </h3>
          {error && <p className='text-red-600 mb-4'>{error}</p>}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <input
              type='text'
              placeholder='Task Title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <textarea
              placeholder='Description (optional)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              rows={3}
            />
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='todo'>Todo</option>
                <option value='in-progress'>In Progress</option>
                <option value='done'>Done</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
              </select>
              <input
                type='date'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='flex items-center space-x-4'>
              <button
                type='submit'
                className='bg-blue-600 cursor-pointer text-white px-5 py-2 rounded hover:bg-blue-700 transition-colors'
              >
                {editingTaskId ? 'Update Task' : 'Add Task'}
              </button>
              {editingTaskId && (
                <button
                  type='button'
                  onClick={() => {
                    setEditingTaskId(null);
                    setTitle('');
                    setDescription('');
                    setStatus('todo');
                    setPriority('medium');
                    setDueDate('');
                  }}
                  className='text-gray-600 cursor-pointer'
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

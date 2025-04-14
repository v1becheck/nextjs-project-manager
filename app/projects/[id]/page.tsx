'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await fetch(`/api/projects/${projectId}`, {
          credentials: 'include',
        });
        if (projRes.ok) {
          const projData = await projRes.json();
          setProject(projData);
        } else if (projRes.status === 404) {
          router.push('/projects');
        }

        const taskRes = await fetch(`/api/tasks?projectId=${projectId}`, {
          credentials: 'include',
        });
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          setTasks(taskData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    try {
      if (editingTaskId === null) {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title, description, projectId }),
        });
        if (!res.ok) throw new Error('Failed to create task');
        const newTask = await res.json();
        setTasks((prev) => [...prev, newTask]);
      } else {
        const res = await fetch(`/api/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title, description }),
        });
        if (!res.ok) throw new Error('Failed to update task');
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTaskId ? updated : t))
        );
      }

      setTitle('');
      setDescription('');
      setEditingTaskId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header with back button */}
      <header className='bg-white shadow py-4 px-6 flex items-center justify-between'>
        <button
          onClick={() => router.push('/projects')}
          className='text-blue-600 hover:underline text-sm'
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

        {/* Tasks List */}
        <section className='mb-8'>
          <h3 className='text-xl font-semibold mb-4 text-gray-800'>Tasks</h3>
          {tasks.length === 0 ? (
            <p className='text-gray-600'>No tasks for this project yet.</p>
          ) : (
            <ul className='space-y-4'>
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className='bg-white p-4 rounded shadow flex justify-between items-start'
                >
                  <div>
                    <p className='text-lg font-medium text-gray-800'>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className='text-gray-600 mt-1'>{task.description}</p>
                    )}
                  </div>
                  <div className='flex flex-col items-end space-y-2'>
                    <button
                      onClick={() => startEditTask(task)}
                      className='text-sm text-blue-600 hover:underline'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className='text-sm text-red-600 hover:underline'
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
        <section className='bg-white p-6 rounded shadow'>
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
            ></textarea>
            <div className='flex items-center space-x-4'>
              <button
                type='submit'
                className='bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-colors'
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
                  }}
                  className='text-gray-600 hover:underline'
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

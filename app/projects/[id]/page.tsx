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
      let projRes = await fetch(`/api/projects/${projectId}`, {
        credentials: 'include',
      });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProject(projData);
      } else if (projRes.status === 404) {
        router.push('/projects');
      }

      let taskRes = await fetch(`/api/tasks?projectId=${projectId}`, {
        credentials: 'include',
      });
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTasks(taskData);
      }
    };
    fetchData();
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title) {
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
    if (!confirm('Delete this task?')) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  return (
    <div className='max-w-xl mx-auto p-4'>
      <button
        onClick={() => router.push('/projects')}
        className='underline text-sm mb-4 inline-block'
      >
        ← Back to Projects
      </button>

      {project ? (
        <div className='mb-6'>
          <h1 className='text-2xl font-bold'>{project.name}</h1>
          {project.description && (
            <p className='text-gray-700'>{project.description}</p>
          )}
        </div>
      ) : (
        <p className='mb-6'>Loading project...</p>
      )}

      {/* Tasks List */}
      <h2 className='text-xl font-semibold mb-2'>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks for this project yet.</p>
      ) : (
        <ul className='mb-6'>
          {tasks.map((task) => (
            <li key={task.id} className='border-b py-2 flex justify-between'>
              <div>
                <span className='font-medium'>{task.title}</span>
                {task.description && (
                  <span className='text-sm text-gray-600'>
                    {' '}
                    – {task.description}
                  </span>
                )}
              </div>
              <div>
                <button
                  onClick={() => startEditTask(task)}
                  className='text-sm text-gray-700 mr-4'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className='text-sm text-red-600'
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add/Edit Task Form */}
      <div className='bg-gray-100 p-4 rounded'>
        <h3 className='font-medium mb-2'>
          {editingTaskId ? 'Edit Task' : 'Add New Task'}
        </h3>
        <form onSubmit={handleSubmit} className='flex flex-col space-y-3'>
          {error && <p className='text-red-600'>{error}</p>}
          <input
            type='text'
            placeholder='Task title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='p-2 border'
          />
          <textarea
            placeholder='Description (optional)'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='p-2 border'
          />
          <div className='flex items-center space-x-4'>
            <button
              type='submit'
              className='bg-blue-600 text-white px-4 py-2 rounded'
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
                className='text-sm'
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

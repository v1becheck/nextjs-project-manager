// app/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  description: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    try {
      if (editingId === null) {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) throw new Error('Failed to create project');
        const newProject = await res.json();
        setProjects((prev) => [...prev, newProject]);
      } else {
        const res = await fetch(`/api/projects/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) throw new Error('Failed to update project');
        const updated = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
      }
      setName('');
      setDescription('');
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description || '');
  };

  const handleDelete = async (projectId: number) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <header className='flex items-center justify-between bg-white py-4 px-6 shadow'>
        <h1 className='text-3xl font-bold text-gray-800'>Your Projects</h1>
        <button
          onClick={handleLogout}
          className='text-gray-600 hover:underline'
        >
          Logout
        </button>
      </header>
      <main className='max-w-4xl mx-auto p-6'>
        {projects.length === 0 ? (
          <p className='text-center text-gray-600'>
            No projects yet. Create one below!
          </p>
        ) : (
          <ul className='space-y-4 mb-8'>
            {projects.map((project) => (
              <li
                key={project.id}
                className='bg-white p-4 rounded shadow flex justify-between items-center'
              >
                <div>
                  <Link
                    href={`/projects/${project.id}`}
                    className='text-xl font-semibold text-blue-600 hover:underline'
                  >
                    {project.name}
                  </Link>
                  {project.description && (
                    <p className='text-gray-500'>{project.description}</p>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => startEdit(project)}
                    className='text-gray-700 mr-4 hover:underline'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className='text-red-600 hover:underline'
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className='bg-white p-6 rounded shadow'>
          <h2 className='text-2xl font-semibold mb-4'>
            {editingId ? 'Edit Project' : 'New Project'}
          </h2>
          {error && <p className='text-red-500 mb-4'>{error}</p>}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <input
              type='text'
              placeholder='Project Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <textarea
              placeholder='Description (optional)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <div className='flex items-center space-x-4'>
              <button
                type='submit'
                className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition'
              >
                {editingId ? 'Update Project' : 'Add Project'}
              </button>
              {editingId && (
                <button
                  type='button'
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setDescription('');
                  }}
                  className='text-sm text-gray-600 hover:underline'
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

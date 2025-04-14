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
    if (!name) {
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
    if (!confirm('Are you sure you want to delete this project?')) return;
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
    <div className='max-w-2xl mx-auto p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Your Projects</h1>
        <button
          onClick={handleLogout}
          className='text-sm text-gray-600 underline'
        >
          Logout
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <p>No projects yet. Create one below!</p>
      ) : (
        <ul className='mb-8'>
          {projects.map((project) => (
            <li
              key={project.id}
              className='border-b py-2 flex justify-between items-center'
            >
              <div>
                <Link
                  href={`/projects/${project.id}`}
                  className='text-blue-600 hover:underline'
                >
                  {project.name}
                </Link>
                {project.description && (
                  <p className='text-sm text-gray-600'>{project.description}</p>
                )}
              </div>
              <div>
                <button
                  onClick={() => startEdit(project)}
                  className='text-sm text-gray-700 mr-4'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className='text-sm text-red-600'
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create/Edit Project Form */}
      <div className='bg-gray-100 p-4 rounded'>
        <h2 className='text-xl font-semibold mb-2'>
          {editingId ? 'Edit Project' : 'New Project'}
        </h2>
        <form onSubmit={handleSubmit} className='flex flex-col space-y-3'>
          {error && <p className='text-red-600'>{error}</p>}
          <input
            type='text'
            placeholder='Project name'
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              className='bg-green-600 text-white px-4 py-2 rounded'
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

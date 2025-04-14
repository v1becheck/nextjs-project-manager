'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),

        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      router.push('/projects');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className='max-w-sm mx-auto mt-12 p-6 bg-white rounded shadow'>
      <h2 className='text-2xl font-bold mb-6 text-center'>Login</h2>
      <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
        {error && <p className='text-red-600'>{error}</p>}
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='border p-2'
          required
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border p-2'
          required
        />
        <button type='submit' className='bg-blue-600 text-white py-2 rounded'>
          Log In
        </button>
      </form>
    </div>
  );
}

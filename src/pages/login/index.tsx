import axios from 'axios'
import React, { useState } from 'react'

export default function Page() {
 const [username, setUsername] = useState('')
 const [password, setPassword] = useState('')

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const response = await axios.post('http://localhost:3000/user/login', {
   username,
   password
  })
  console.log(response)
 }

 return (
  <div className='flex flex-col items-center gap-2 justify-center h-screen'>
   <h1 className='text-2xl font-bold'>Login</h1>
   <form
    className='flex flex-col gap-2'
    onSubmit={handleSubmit}>
    <input
     type='text'
     placeholder='Username'
     value={username}
     onChange={(e) => setUsername(e.target.value)}
    />
    <input
     type='password'
     placeholder='Password'
     value={password}
     onChange={(e) => setPassword(e.target.value)}
    />
    <button type='submit'>Login</button>
   </form>
  </div>
 )
}

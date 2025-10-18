// Migración de la página de búsqueda de productos
'use client'
import React, { useState } from 'react'

export default function ProductSearchPage() {
  const [searchInput, setSearchInput] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert(searchInput)
  }

  return (
    <div>
      <form action="" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={handleInputChange}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  )
}

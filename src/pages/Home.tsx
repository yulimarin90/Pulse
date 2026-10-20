import React from 'react'
import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <section>
        <h1> Hola, </h1>
        <div className="actions">
            <Link to="/" className="btn">Tweet</Link>
            <Link to="/feed" className="btn btn-outline">My feed </Link>
            <Link to="" className="btn btn-outline">My tweets</Link>
        </div>
    </section>
    
  )
}

import React from 'react'
import './Quiz.css'

const Quiz = () => {
  return (
    <div className='container'>
        <h1>Quiz App</h1>
        <hr/>

        <h2> Who created Facebook?</h2>
        <ul>
            <li>Adolf Hitler</li>
            <li>Mark Zuckerberg</li>
            <li>Ivan Fortich</li>
            <li>Elon Musk</li>
        </ul>
        <button>Next</button>
        <div className='index'>1/5 questions</div>
    </div>
  )
}

export default Quiz
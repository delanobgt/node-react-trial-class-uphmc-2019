import React from 'react'
import { Link } from 'react-router-dom'

export default (props) => {
  const style = {
    textDecoration: 'none',
    outline: 'none',
    border: 'none'
  }
  return (
    <Link {...props} style={style} >
      {props.children}
    </Link>
  )
}

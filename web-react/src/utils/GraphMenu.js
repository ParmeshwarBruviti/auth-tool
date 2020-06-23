import React from 'react'

import useContextMenu from './useContextMenu'

const GraphMenu = ({ outerRef }) => {
  const { xPos, yPos, menu } = useContextMenu(outerRef)
  console.log(`xpos is ${xPos} and yPos is ${yPos} and menu is ${menu}`)
  if (menu) {
    return (
      <ul className="menu" style={{ top: yPos, left: xPos }}>
        <li>Item1</li>
        <li>Item2</li>
        <li>Item3</li>
      </ul>
    )
  }
  return <></>
}

export default GraphMenu

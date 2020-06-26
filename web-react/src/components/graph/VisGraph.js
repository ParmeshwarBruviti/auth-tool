import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import CytoscapeComponent from 'react-cytoscapejs'
import './graph.scss'
import { useState } from 'react'

const GET_RECENT_REVIEWS_QUERY = gql`
  {
    Review(first: 20, orderBy: date_desc) {
      user {
        _id
        name
      }
      business {
        _id
        name
      }
      date {
        formatted
      }
      _id
      text
      stars
    }
  }
`

export default function VisGraphs() {
  const { loading, error, data } = useQuery(GET_RECENT_REVIEWS_QUERY)
  const [selectedElement, setSelectedElement] = useState()
  let cyComp

  const setNodeClickListener = () => {
    if (cyComp !== undefined) {
      cyComp.removeListener('click')
      cyComp.bind('click', (event) => {
        let object = event.target
        if (object === cyComp) {
          console.log('')
        } else if (object.isNode()) {
          let nodeJson = JSON.stringify(object.json())
          console.log(nodeJson + ' node clicked')
          setSelectedElement(object.json())
        } else if (object.isEdge()) {
          let edgeJson = JSON.stringify(object.json())
          console.log(edgeJson + ' node clicked')
          setSelectedElement(object.json())
        }
      })
    }
  }

  useEffect(() => {
    setNodeClickListener()
  })

  if (error) return <p>Error</p>
  if (loading) return <p>Loading</p>

  function getNode(id, label, color, nodeType) {
    return {
      data: { id: id, label: label, color: color, type: nodeType },
    }
  }

  function getElements() {
    const elements = []

    data.Review.map((review) => {
      elements.push(getNode(review._id, review.text, '#FF5733', 'Review'))
      elements.push(
        getNode(
          review.business._id,
          review.business.name,
          '#33FF49',
          'Business'
        )
      )

      elements.push(
        getNode(review.user._id, review.user.name, '#3342FF', 'User')
      )
      elements.push({
        data: { source: review._id, target: review.business._id, type: 'Edge' },
      })
      elements.push({
        data: {
          source: review._id,
          target: review.user._id,
          type: 'Edge',
          label: 'dummy one',
        },
      })
    })
    console.log('elements are', elements)
    return elements
  }

  return (
    <div className="visGraphRoot">
      <div>
        <button
          style={{
            color: '#FFFFFF',
            backgroundColor: '#3342FF',
            padding: '0.2rem',
            margin: '0.2rem',
          }}
        >
          {' '}
          USER{' '}
        </button>
        <button
          style={{
            backgroundColor: '#33FF49',
            padding: '0.2rem',
            margin: '0.2rem',
          }}
        >
          {' '}
          Business{' '}
        </button>
        <button
          style={{
            backgroundColor: '#FF5733',
            padding: '0.2rem',
            margin: '0.2rem',
          }}
        >
          {' '}
          Review{' '}
        </button>
      </div>
      <div className="graphAndDetailsArea">
        <CytoscapeComponent
          cy={(cy) => {
            cyComp = cy
          }}
          elements={getElements()}
          layout={{ name: 'circle', padding: 10 }}
          style={{ width: '1100px', height: '600px' }}
          stylesheet={[
            {
              selector: 'node',
              style: {
                height: 80,
                width: 80,
                backgroundFit: 'cover',
                borderColor: 'data(color)',
                borderWidth: 10,
                borderOpacity: 0.8,
                label: 'data(label)',
              },
            },
            {
              selector: 'edge',
              style: {
                width: 10,
              },
            },
          ]}
        />
        <div className="detailsArea">
          {/* <AddDataPanel /> */}
          <GraphDetailspanel selectedItem={selectedElement} />
        </div>
      </div>
    </div>
  )
}

// function AddDataPanel() {
//   const [currentForm, setCurrentForm] = useState()

//   function getAddUserForm() {
//     return <div>this is add user form</div>
//   }

//   function getAddBusinessForm() {
//     return <div>this is add Business form</div>
//   }

//   function getAddReviewForm() {
//     return <div>this is add review form</div>
//   }
//   return (
//     <div className="addDataPanel">
//       <div className="actionButtonsContainer">
//         <button onClick={() => setCurrentForm(getAddUserForm)}>
//           {' '}
//           Add User{' '}
//         </button>
//         <button onClick={() => setCurrentForm(getAddBusinessForm)}>
//           {' '}
//           Add Business{' '}
//         </button>
//         <button onClick={() => setCurrentForm(getAddReviewForm)}>
//           {' '}
//           Add Review{' '}
//         </button>
//       </div>
//       <div className="formContainer">{currentForm}</div>
//     </div>
//   )
// }

function GraphDetailspanel(props) {
  return (
    props.selectedItem !== undefined && (
      <div className="detailsPanel">
        <div>
          <h1> {props.selectedItem.data.type}</h1>
          <hr />
          <h3> ID - {props.selectedItem.data.id}</h3>
          <h3> Data - {props.selectedItem.data.label}</h3>
        </div>
        <div></div>
      </div>
    )
  )
}

import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Title from '../Title'

import { DeleteForever, Edit } from '@material-ui/icons'

import ReviewAddEditDialog from './ReviewAddEditDialog'

const GET_RECENT_REVIEWS_QUERY = gql`
  {
    Review(first: 50, orderBy: date_desc) {
      reviewId
      text
      stars
      user {
        userId
        name
      }
      business {
        businessId
        name
      }
      date {
        year
        month
        day
        formatted
      }
    }
  }
`

const UPDATE_REVIEW = gql`
  mutation updateReview($id: ID!, $reviewText: String) {
    MergeReview(reviewId: $id, text: $reviewText) {
      text
    }
  }
`

const DELETE_REVIEW = gql`
  mutation deleteReview($reviewId: ID!) {
    DeleteReview(reviewId: $reviewId) {
      text
    }
  }
`

export default function ReviewList() {
  const { loading, error, data } = useQuery(GET_RECENT_REVIEWS_QUERY)
  const [reviewToEdit, setReviewToEdit] = React.useState({})

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    refetchQueries: () => [
      {
        query: GET_RECENT_REVIEWS_QUERY,
      },
    ],
  })
  const [updateReviewAtServer] = useMutation(UPDATE_REVIEW, {
    refetchQueries: () => [
      {
        query: GET_RECENT_REVIEWS_QUERY,
      },
    ],
  })

  function editReview(reviewForEditing) {
    setReviewToEdit((oldReview) => ({
      ...oldReview,
      review: reviewForEditing,
    }))
  }

  function updateReview(updatedReviewObj) {
    updateReviewAtServer({
      variables: {
        id: updatedReviewObj.reviewId,
        reviewText: updatedReviewObj.text,
      },
    })
  }

  function clearReview() {
    setReviewToEdit({})
  }

  if (error) return <p>Error</p>
  if (loading) return <p>Loading</p>

  return (
    <React.Fragment>
      <Title>Recent Reviews</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Business Name</TableCell>
            <TableCell>User Name</TableCell>
            <TableCell>Review Text</TableCell>
            <TableCell>Review Stars</TableCell>
            <TableCell>Edit</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.Review.map((review) => (
            <TableRow key={review.reviewId}>
              <TableCell>{review.date.formatted}</TableCell>
              <TableCell>{review.business.name}</TableCell>
              <TableCell>{review.user.name}</TableCell>
              <TableCell>{review.text}</TableCell>
              <TableCell>{review.stars}</TableCell>
              <TableCell
                onClick={() => {
                  editReview(review)
                }}
              >
                {<Edit />}
              </TableCell>
              <TableCell
                onClick={() => {
                  deleteReview({ variables: { reviewId: review.reviewId } })
                }}
              >
                {<DeleteForever />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ReviewAddEditDialog
        reviewData={reviewToEdit}
        clearReview={clearReview}
        update={updateReview}
      />
    </React.Fragment>
  )
}

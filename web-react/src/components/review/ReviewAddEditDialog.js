import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import MenuItem from '@material-ui/core/MenuItem'

const GET_USERS = gql`
  {
    User(first: 20) {
      userId
      name
    }
  }
`

const GET_BUSINESS = gql`
  {
    Business(first: 20) {
      businessId
      name
    }
  }
`

export default function ReviewAddEditDialog(props) {
  const [open, setOpen] = React.useState(false)
  const [updatedReview, setUpdatedReview] = useState(props.reviewData.review)
  const { loading: userLoading, data: userData, error: userError } = useQuery(
    GET_USERS
  )
  const {
    loading: businessLoading,
    data: businessData,
    error: businessError,
  } = useQuery(GET_BUSINESS)
  const [selectedUser, setSelectedUser] = useState()
  const [selectedBusiness, setSelectedBusiness] = useState()

  useEffect(() => {
    if (
      props.reviewData.review !== undefined &&
      props.reviewData.review.reviewId !== undefined
    ) {
      if (!open) {
        console.log(`${JSON.stringify(props.reviewData.review.user)}`)
        setOpen(true)
        setUpdatedReview(JSON.stringify(props.reviewData.review))

        setSelectedUser((oldUser) => ({
          ...oldUser,
          user: props.reviewData.review.user,
        }))

        setSelectedBusiness((oldBusiness) => ({
          ...oldBusiness,
          business: props.reviewData.review.business,
        }))
      }
    }
  })

  const handleOnChange = (e) => {
    console.log(`${e.target.value}`)
    let newReviewText = e.target.value
    setUpdatedReview((oldReview) => ({
      ...oldReview,
      text: newReviewText,
    }))

    console.log(`updated review is - ${JSON.stringify(updatedReview)}`)
  }

  const handleClose = () => {
    props.clearReview()
    setOpen(false)
  }

  const handleSave = () => {
    props.update(updatedReview)
    setOpen(false)
    props.clearReview()
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit Review </DialogTitle>
        <DialogContent>
          {userLoading && !userError && <p>Loading...</p>}
          {userError && !userLoading && <p>Error</p>}
          {userData && !userLoading && !userError && (
            <TextField
              id="user-select"
              select
              label="Select User"
              value={selectedUser ? selectedUser.user.userId : ''}
              helperText="Update user if you want"
            >
              {userData.User.map((user) => (
                <MenuItem key={user.userId} value={user.userId}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {businessLoading && !businessError && <p>Loading...</p>}
          {businessError && !businessLoading && <p>Error</p>}
          {businessData && !businessLoading && !businessError && (
            <TextField
              id="user-select"
              select
              label="Select Business"
              value={
                selectedBusiness ? selectedBusiness.business.businessId : ''
              }
              helperText="Update business if you want"
            >
              {businessData.Business.map((business) => (
                <MenuItem key={business.businessId} value={business.businessId}>
                  {business.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <DialogContentText>
            Old Review -{' '}
            {props.reviewData.review ? props.reviewData.review.text : 'null'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="New Review"
            type="text"
            onChange={handleOnChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

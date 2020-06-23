import React, { useEffect } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

export default function UserAddEditDialog(props) {
  const [open, setOpen] = React.useState(false)
  const [updatedUser, setUpdatedUser] = React.useState({
    id: props.user.id,
    name: undefined,
  })

  useEffect(() => {
    if (props.user.name !== undefined) {
      setOpen(true)
    }
  })

  const handleOnChange = (e) => {
    console.log(`${e.target.value}`)
    let newName = e.target.value
    setUpdatedUser((oldUser) => ({
      ...oldUser,
      id: props.user.id,
      name: newName,
    }))
  }

  const handleClose = () => {
    props.clearUser()
    setOpen(false)
  }

  const handleSave = () => {
    props.update(updatedUser)
    setOpen(false)
    props.clearUser()
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set new name to user - ({props.user.name}).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="User Name"
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

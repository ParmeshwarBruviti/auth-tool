import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { withStyles } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  TableSortLabel,
  TextField,
} from '@material-ui/core'

import { DeleteForever, Edit } from '@material-ui/icons'

import Title from './Title'
import UserAddEditDialog from './user/UserAddEditDialog'

const styles = (theme) => ({
  root: {
    maxWidth: 900,
    marginTop: theme.spacing(3),
    overflowX: 'auto',
    margin: 'auto',
  },
  table: {
    minWidth: 700,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 300,
  },
  button: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 50,
    maxHeight: 50,
  },
})

const GET_USER = gql`
  query usersPaginateQuery(
    $first: Int
    $offset: Int
    $orderBy: [_UserOrdering]
    $filter: _UserFilter
  ) {
    User(first: $first, offset: $offset, orderBy: $orderBy, filter: $filter) {
      id: userId
      name
      avgStars
      numReviews
    }
  }
`

const CREATE_USER = gql`
  mutation createUser($userName: String) {
    CreateUser(name: $userName) {
      name
    }
  }
`

const UPDATE_USER = gql`
  mutation updateUser($id: ID!, $userName: String) {
    MergeUser(userId: $id, name: $userName) {
      name
    }
  }
`

const DELETE_USER = gql`
  mutation deleteUser($userId: ID!) {
    DeleteUser(userId: $userId) {
      name
    }
  }
`

function UserList(props) {
  const { classes } = props
  const [order, setOrder] = React.useState('asc')
  const [orderBy, setOrderBy] = React.useState('name')
  const [page] = React.useState(0)
  const [rowsPerPage] = React.useState(20)
  const [filterState, setFilterState] = React.useState({ usernameFilter: '' })
  const [addUserState, setAddUserState] = React.useState({ userName: '' })
  const [userToEdit, setUserToEdit] = React.useState({
    id: undefined,
    name: undefined,
  })

  const [saveUser] = useMutation(CREATE_USER, {
    variables: {
      userName: addUserState.userName,
    },
    refetchQueries: () => [
      {
        query: GET_USER,
        variables: {
          first: rowsPerPage,
          offset: rowsPerPage * page,
          orderBy: orderBy + '_' + order,
          filter: getFilter(),
        },
      },
    ],
  })

  const [updateUserAtServer] = useMutation(UPDATE_USER, {
    refetchQueries: () => [
      {
        query: GET_USER,
        variables: {
          first: rowsPerPage,
          offset: rowsPerPage * page,
          orderBy: orderBy + '_' + order,
          filter: getFilter(),
        },
      },
    ],
  })

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: () => [
      {
        query: GET_USER,
        variables: {
          first: rowsPerPage,
          offset: rowsPerPage * page,
          orderBy: orderBy + '_' + order,
          filter: getFilter(),
        },
      },
    ],
  })

  function clearUser() {
    setUserToEdit({ id: undefined, name: undefined })
  }

  function updateUser(updatedUserObj) {
    //alert(`${updatedUserObj.id} and ${updatedUserObj.name}`)

    updateUserAtServer({
      variables: {
        id: updatedUserObj.id,
        userName: updatedUserObj.name,
      },
    })
  }

  function editUser(id, name) {
    setUserToEdit({ id: id, name: name })
  }

  function validateAndSaveUser() {
    if (addUserState.userName != '') {
      saveUser()
    }
  }

  const getFilter = () => {
    return filterState.usernameFilter.length > 0
      ? { name_contains: filterState.usernameFilter }
      : {}
  }

  const { loading, data, error } = useQuery(GET_USER, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      orderBy: orderBy + '_' + order,
      filter: getFilter(),
    },
  })

  const handleSortRequest = (property) => {
    const newOrderBy = property
    let newOrder = 'desc'

    if (orderBy === property && order === 'desc') {
      newOrder = 'asc'
    }

    setOrder(newOrder)
    setOrderBy(newOrderBy)
  }

  const handleAddUserChange = (userName) => (event) => {
    const val = event.target.value

    setAddUserState((oldUserName) => ({
      ...oldUserName,
      [userName]: val,
    }))
  }
  const handleFilterChange = (filterName) => (event) => {
    const val = event.target.value

    setFilterState((oldFilterState) => ({
      ...oldFilterState,
      [filterName]: val,
    }))
  }

  return (
    <Paper className={classes.root}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Title>User List</Title>
          <TextField
            id="search"
            label="Search user"
            className={classes.textField}
            value={filterState.usernameFilter}
            onChange={handleFilterChange('usernameFilter')}
            margin="normal"
            variant="outlined"
            type="text"
            InputProps={{
              className: classes.input,
            }}
          />
        </div>
        <div>
          <Title>Add User</Title>
          <div style={{ display: 'flex' }}>
            <TextField
              id="addUser"
              label="Just user name"
              className={classes.textField}
              value={addUserState.userName}
              onChange={handleAddUserChange('userName')}
              margin="normal"
              variant="outlined"
              type="text"
              InputProps={{
                className: classes.input,
              }}
            />
            <button
              onClick={() => {
                validateAndSaveUser()
                setAddUserState({ userName: '' })
              }}
              className={classes.button}
            >
              Add
            </button>
          </div>
        </div>
      </div>
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell
                key="name"
                sortDirection={orderBy === 'name' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={order}
                    onClick={() => handleSortRequest('name')}
                  >
                    Name
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell
                key="avgStars"
                sortDirection={orderBy === 'avgStars' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-end" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'avgStars'}
                    direction={order}
                    onClick={() => handleSortRequest('avgStars')}
                  >
                    Average Stars
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell
                key="numReviews"
                sortDirection={orderBy === 'numReviews' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'numReviews'}
                    direction={order}
                    onClick={() => handleSortRequest('numReviews')}
                  >
                    Number of Reviews
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell key="Edit">
                <TableHead>Edit</TableHead>
              </TableCell>

              <TableCell key="Delete">
                <TableHead>Delete</TableHead>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.User.map((n) => {
              return (
                <TableRow key={n.id}>
                  <TableCell component="th" scope="row">
                    {n.name}
                  </TableCell>
                  <TableCell>
                    {n.avgStars ? n.avgStars.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell>{n.numReviews}</TableCell>
                  <TableCell>
                    <Edit onClick={() => editUser(n.id, n.name)} />
                  </TableCell>
                  <TableCell>
                    {n.numReviews == 0 && (
                      <DeleteForever
                        onClick={() =>
                          deleteUser({ variables: { userId: n.id } })
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      <UserAddEditDialog
        user={userToEdit}
        clearUser={clearUser}
        update={updateUser}
      />
    </Paper>
  )
}

export default withStyles(styles)(UserList)

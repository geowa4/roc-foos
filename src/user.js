import Immutable from 'immutable'
import Rx from 'rx'
import Firebase from 'firebase'

/* Private Definitions */
const userFirebaseRef = new Firebase('https://roc-foos.firebaseio.com/users')

const UserRecord = Immutable.Record({
  uid: undefined,
  github_id: undefined,
  github_username: 'anon',
  github_profileImageURL: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro',
  github_displayName: 'Anonymous',
  github_email: undefined
})

const authWith = Rx.Observable
.fromNodeCallback(
  userFirebaseRef.authWithOAuthPopup,
  userFirebaseRef
)
const makeUserFromAuthData = (authData) => {
  return new UserRecord({
    uid: authData.uid,
    github_id: authData.github.id,
    github_username: authData.github.username,
    github_profileImageURL: authData.github.profileImageURL,
    github_displayName: authData.github.displayName,
    github_email: authData.github.email
  })
}

const getInitialUserRecord = () => {
  const authData = userFirebaseRef.getAuth()
  if (authData != null && authData.uid != null) {
    return makeUserFromAuthData(authData)
  }
  else {
    return new UserRecord()
  }
}
const currentUser = new Rx.BehaviorSubject(getInitialUserRecord())

/* Exports */
// user shareReplay to convert Subject (rw) to Observable (ro).
export const userStream = currentUser.shareReplay(1)

export function login () {
  authWith('github')
  .map(makeUserFromAuthData)
  .forEach(
    user => currentUser.onNext(user),
    err => console.error(err)
  )
}

export function logout () {
  userFirebaseRef.unauth()
  currentUser.onNext(new UserRecord())
}

/* Hooks */
// save user upon login
userStream
.filter(user => user.get('uid') != null)
.forEach(user => {
  userFirebaseRef
  .child(user.get('uid'))
  .set({
    github_id: user.get('github_id'),
    github_username: user.get('github_username'),
    github_profileImageURL: user.get('github_profileImageURL'),
    github_displayName: user.get('github_displayName'),
    github_email: user.get('github_email')
  })
})

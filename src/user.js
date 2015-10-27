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
  github_email: undefined,
  facebook_id: undefined,
  facebook_displayName: 'Anonymous',
  facebook_profileImageURL: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro',
})

const authWith = Rx.Observable
.fromNodeCallback(
  userFirebaseRef.authWithOAuthPopup,
  userFirebaseRef
)
const makeUserFromAuthData = (authData) => {
  if (authData.facebook !== undefined) {
    return new UserRecord({
      uid: authData.uid,
      facebook_id: authData.facebook.id,
      facebook_displayName: authData.facebook.displayName,
      facebook_profileImageURL: authData.facebook.profileImageURL
    })
  }
  else {
    return new UserRecord({
      uid: authData.uid,
      github_id: authData.github.id,
      github_username: authData.github.username || null,
      github_profileImageURL: authData.github.profileImageURL || null,
      github_displayName: authData.github.displayName || null,
      github_email: authData.github.email || null,
    })
  }
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

export function login (provider) {
  authWith(provider)
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
  // There is a 'provider' in here that I think that would be better to
  // check for than the facebook_id.
  if (user.get('facebook_id') !== undefined) {
    userFirebaseRef
    .child(user.get('uid'))
    .set({
      facebook_id: user.get('facebook_id'),
      facebook_profileImageURL: user.get('facebook_profileImageURL'),
      facebook_displayName: user.get('facebook_displayName'),
    })
  } else {
    userFirebaseRef
    .child(user.get('uid'))
    .set({
      github_id: user.get('github_id'),
      github_username: user.get('github_username'),
      github_profileImageURL: user.get('github_profileImageURL'),
      github_displayName: user.get('github_displayName'),
      github_email: user.get('github_email'),
    })
  }
})

import React from 'react'
import RxReact from 'rx-react'
import { userStream, login, logout } from './user'

export default class extends RxReact.Component {
  getStateStream () {
    return userStream
      .map(user => { return { user: user } })
  }

  componentWillMount () {
    super.componentWillMount()
    this.login = RxReact.FuncSubject.create()
    this.login.forEach(() => login())
    this.logout = RxReact.FuncSubject.create()
    this.logout.forEach(() => logout())
  }

  get innerElements () {
    const user = this.state.user
    if (user.get('uid') == null) {
      return (
        <button onClick={this.login}>login</button>
      )
    }
    else {
      return (
        <div>
          <a href={'https://github.com/' + user.get('github_username')}>
            {user.get('github_username')}
            <img src={user.get('github_profileImageURL') + '&s=30'}/>
          </a>
          <button onClick={this.logout}>logout</button>
        </div>
      )
    }
  }

  render () {
    return (
      <div>{this.innerElements}</div>
    )
  }
}

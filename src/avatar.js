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
    this.login.forEach((e) => {
      login(e.target.attributes['data-provider'].nodeValue);
    })
    this.logout = RxReact.FuncSubject.create()
    this.logout.forEach(() => logout())
  }

  get innerElements () {
    const user = this.state.user
    if (user.get('uid') == null) {
      return (
        <div>
          <button onClick={this.login} data-provider="github">LogIn (Github)</button>
          <button onClick={this.login} data-provider="facebook">LogIn (Facebook)</button>
        </div>
      )
    }
    else {
      if (user.get('facebook_id') !== undefined) {
        return (
          <div>
            <a href={'https://facebook.com/' + user.get('facebook_id')}>
              {user.get('facebook_displayName')}
              <img height='30' width='30' src={user.get('facebook_profileImageURL') + '&s=30'}/>
            </a>
            <button onClick={this.logout}>logout</button>
          </div>
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
  }

  render () {
    return (
      <div>{this.innerElements}</div>
    )
  }
}

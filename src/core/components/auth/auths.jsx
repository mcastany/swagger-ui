import React from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"

export default class Auths extends React.Component {
  static propTypes = {
    definitions: ImPropTypes.iterable.isRequired,
    getComponent: PropTypes.func.isRequired,
    authSelectors: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    errSelectors: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)

    this.state = {}
  }

  onAuthChange =(auth) => {
    let { name } = auth

    this.setState({ [name]: auth })
  }

  submitAuth =(e) => {
    e.preventDefault()

    let { authActions } = this.props
    authActions.authorizeWithPersistOption(this.state)
  }

  logoutClick =(e) => {
    e.preventDefault()

    let { authActions, definitions } = this.props
    let auths = definitions.map( (val, key) => {
      return key
    }).toArray()

    this.setState(auths.reduce((prev, auth) => {
      prev[auth] = ""
      return prev
    }, {}))

    authActions.logoutWithPersistOption(auths)
  }

  close =(e) => {
    e.preventDefault()
    let { authActions } = this.props

    authActions.showDefinitions(false)
  }

  render() {
    let { definitions, getComponent, authSelectors, errSelectors } = this.props
    const AuthItem = getComponent("AuthItem")
    const Oauth2 = getComponent("oauth2", true)
    const Button = getComponent("Button")

    let authorized = authSelectors.authorized()

    let authorizedAuth = definitions.filter( (definition, key) => {
      return !!authorized.get(key)
    })

    let nonOauthDefinitions = definitions.filter( schema => schema.get("type") !== "oauth2")
    let oauthDefinitions = definitions.filter( schema => schema.get("type") === "oauth2")

    return (
      <div className="auth-container">
        {
          !!nonOauthDefinitions.size && <form onSubmit={ this.submitAuth }>
            {
              nonOauthDefinitions.map( (schema, name) => {
                return <AuthItem
                  key={name}
                  schema={schema}
                  name={name}
                  getComponent={getComponent}
                  onAuthChange={this.onAuthChange}
                  authorized={authorized}
                  errSelectors={errSelectors}
                  />
              }).toArray()
            }
            <div className="auth-btn-wrapper">
              {
                nonOauthDefinitions.size === authorizedAuth.size ? <Button className="btn modal-btn auth" onClick={ this.logoutClick }>Logout</Button>
              : <Button type="submit" className="btn modal-btn auth authorize">Authorize</Button>
              }
              <Button className="btn modal-btn auth btn-done" onClick={ this.close }>Close</Button>
            </div>
          </form>
        }

        {
          oauthDefinitions && oauthDefinitions.size ? <div>
            {
              definitions.filter( schema => schema.get("type") === "oauth2")
                .map( (schema, name) =>{
                  return (<div key={ name }>
                    <Oauth2 authorized={ authorized }
                            schema={ schema }
                            name={ name } />
                  </div>)
                }
                ).toArray()
            }
          </div> : null
        }

      </div>
    )
  }

}

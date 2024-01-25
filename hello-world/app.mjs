import AmazonCognitoIdentity  from 'amazon-cognito-identity-js'
import axios from 'axios'

export const lambdaHandler = async (e) => {
    console.log(e)
    const poolData = {
        UserPoolId: 'us-east-1_SWTiH7d38',
        ClientId: '16seahimlsre6ocin0uvivtet2'
    }

    const Pool = new AmazonCognitoIdentity.CognitoUserPool(poolData)

    const Username = e.userName
    const Password = e.request.password
    const authenticationData = { Username, Password }
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData)
    const userData = { Username, Pool }

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
    console.log(await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: () => {
                console.log('auth ok cognito', e.userName)
                resolve('Authentication successful')
            },
            onFailure: (err) => {
                console.log('failure, lets try traccar', err)
                const body = 'email=' + encodeURIComponent(Username) + '&password=' + encodeURIComponent(Password)
                console.log(body)
                axios.post('https://api2.pinme.io/api/session', body, {
                    headers: {
                        'user-agent': 'pinme-backend',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(r => resolve(r.data)).catch(e => reject(e))
            },
            newPasswordRequired: () => {
                console.log('new password required', e.userName)
                resolve('New password required')
            }
        })
    }))

    e.response.userAttributes = {
        email: Username,
        email_verified: true
    }
    e.response.finalUserStatus = 'CONFIRMED'
    e.response.messageAction = 'SUPPRESS'
    console.log('returning', e)
    return e
}

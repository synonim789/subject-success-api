import axios from 'axios'

interface GetGoogleUser {
  id_token: string
  access_token: string
}

interface GoogleUserResult {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

const getGoogleUser = async ({
  id_token,
  access_token,
}: GetGoogleUser): Promise<GoogleUserResult> => {
  const res = await axios.get<GoogleUserResult>(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  )
  return res.data
}

export default getGoogleUser

import axios from 'axios';
import qs from 'querystring';
import env from './cleanEnv';

interface GetGithubUser {
   code: string;
}

interface GithubUser {
   login: string;
   id: number;
   node_id: string;
   avatar_url: string;
   gravatar_id: string;
   url: string;
   html_url: string;
   followers_url: string;
   following_url: string;
   gists_url: string;
   starred_url: string;
   subscriptions_url: string;
   organizations_url: string;
   repos_url: string;
   events_url: string;
   received_events_url: string;
   type: string;
   site_admin: boolean;
   name: null | string;
   company: null | string;
   blog: string;
   location: null | string;
   email: null | string;
   hireable: null | boolean;
   bio: null | string;
   twitter_username: null | string;
   public_repos: number;
   public_gists: number;
   followers: number;
   following: number;
   created_at: string;
   updated_at: string;
}

type GithubEmail = {
   email: string;
   primary: boolean;
   verified: true;
   visibility?: boolean;
};

const getGithubUser = async ({ code }: GetGithubUser) => {
   const githubToken = await axios.post(
      `https://github.com/login/oauth/access_token?client_id=${env.GITHUB_CLIENT_ID}&client_secret=${env.GITHUB_CLIENT_SECRET}&code=${code}`,
   );
   const accessTokenObject = qs.decode(githubToken.data);
   const access_token = accessTokenObject.access_token;

   const githubUser = await axios.get<GithubUser>(
      'https://api.github.com/user',
      {
         headers: { Authorization: `Bearer ${access_token}` },
      },
   );

   const githubUserEmails = await axios.get<GithubEmail[]>(
      'https://api.github.com/user/emails',
      {
         headers: { Authorization: `Bearer ${access_token}` },
      },
   );

   const githubUserEmail = githubUserEmails.data.filter(
      (email) => email.primary === true,
   );

   return { githubData: githubUser.data, githubEmail: githubUserEmail[0] };
};
export default getGithubUser;

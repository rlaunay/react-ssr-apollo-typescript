import {gql, useQuery} from "@apollo/client";

type Posts = {
  posts: {
    id: string;
    title: string;
  }[]
}

const GET_POSTS = gql`
    query posts {
      posts {
        id,
        title
      }
    }
`;

const App: React.FC = () => {
  const { data } = useQuery<Posts>(GET_POSTS);

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {data && data.posts.map(p => <li key={p.id} >{p.title}</li>)}
      </ul>
    </div>
  )
};

export default App;
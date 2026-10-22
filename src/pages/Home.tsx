import { useCurrentUser } from '../blog/AuthContext';
import ProfileStats from '../ui/components/ProfileStats';
import { Link } from 'react-router-dom'

export default function Home() {
  const currentUser = useCurrentUser();
  return (
    <section>
        <h1> Hola, </h1>
            <Link to="/tweet/new" className="btn">Tweet</Link>
            <Link to="/feed" className="btn btn-outline">My feed </Link>
            <ProfileStats userId={currentUser.id} linked />
    </section>
    
  )
}

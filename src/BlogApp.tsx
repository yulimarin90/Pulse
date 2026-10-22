import { AuthProvider } from './blog/AuthContext';
import BaseRouter from './routes/BaseRouter';

export default function BlogApp() {
  return (
    <AuthProvider>
      <BaseRouter />
    </AuthProvider>
  );
}
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/NotificationProvider';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
        <Toaster />
      </NotificationProvider>
    </AuthProvider>
  );
}

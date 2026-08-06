import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { appRouter } from './routes';
import { ApplicationErrorScreen, ApplicationLoadingScreen } from './pages/ApplicationState';
import { useApplication } from './providers/ApplicationProvider';

function ApplicationRouter(): React.ReactElement {
  const { loading, error } = useApplication();
  if (loading) return <ApplicationLoadingScreen />;
  if (error) return <ApplicationErrorScreen />;
  return <RouterProvider router={appRouter} />;
}

export function App(): React.ReactElement {
  return (
    <AppProviders>
      <ApplicationRouter />
    </AppProviders>
  );
}

import { Link } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Card } from '@supercampus/shared';

export function NotFoundPage(): React.ReactElement {
  return (
    <Card>
      <h1 className="sc-page-title">Page not found</h1>
      <p className="sc-page-desc">The page you are looking for does not exist.</p>
      <Link to={ROUTES.home} className="sc-btn sc-btn-primary sc-btn-md">
        Go home
      </Link>
    </Card>
  );
}

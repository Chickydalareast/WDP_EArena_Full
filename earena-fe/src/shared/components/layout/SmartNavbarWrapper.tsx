import { headers } from 'next/headers';
import PublicNavbar from './PublicNavbar';
import { AppNavbar } from './AppNavbar';


export default async function SmartNavbarWrapper() {
    const headersList = await headers();

    const isAuth = headersList.get('x-is-auth') === 'true';

    if (isAuth) {
        return <AppNavbar />;
    }

    return <PublicNavbar />;
}
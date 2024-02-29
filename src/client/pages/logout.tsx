import { useRouter } from 'next/router';
import { useEffect } from 'react';
function Logout() {
  const router = useRouter();
  useEffect(() => {
    localStorage.clear();
    router.push({ pathname: '/login' });
  });
  return <></>;
}

export default Logout;

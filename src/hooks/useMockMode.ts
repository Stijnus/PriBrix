import { useMemo } from 'react';

type Environment = 'dev' | 'staging' | 'prod';

function getEnvironment(): Environment {
  const rawEnvironment = process.env.EXPO_PUBLIC_ENV;

  if (rawEnvironment === 'staging' || rawEnvironment === 'prod') {
    return rawEnvironment;
  }

  return 'dev';
}

export function useMockMode() {
  return useMemo(() => {
    const environment = getEnvironment();
    const mockFlag = process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

    return {
      environment,
      isMockMode: environment !== 'prod' && mockFlag,
    };
  }, []);
}
